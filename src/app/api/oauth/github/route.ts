import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { github } from "@/lib/oauth";
import prisma from "@/lib/db";
import { lucia } from "@/auth";
import { generateIdFromEntropySize } from "lucia";

type GitHubUserInfo = {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
};

export const GET = async (req: NextRequest) => {
  try {
    // Extract code and state from the URL query parameters
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Validate the presence of code and state
    if (!code || !state) {
      return Response.json(
        { error: "No code or state provided. Invalid request." },
        { status: 400 },
      );
    }

    const storedState = cookies().get("state")?.value;

    // Verify that the received state matches the stored state
    if (storedState !== state) {
      return Response.json(
        { error: "Invalid state. Request may have been tampered with." },
        { status: 400 },
      );
    }

    // Validate the authorization code and get tokens
    const { accessToken } = await github.validateAuthorizationCode(code);

    // Fetch user information from Google API
    const githubRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "GET",
    });

    const githubData = (await githubRes.json()) as GitHubUserInfo;

    // Ensure email is provided by Google
    if (!githubData.email) {
      console.error("No email provided by GitHub. Full response:", githubData);
      return Response.json(
        { error: "Unable to retrieve email from GitHub." },
        { status: 500 },
      );
    }

    // Perform database operations within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find existing user or create a new one
      let user = await tx.user.findFirst({
        where: {
          email: githubData.email,
        },
        include: {
          OAuthAccount: {
            where: {
              provider: "github",
            },
          },
        },
      });

      if (!user) {
        // Create new user if not found
        user = await tx.user.create({
          data: {
            id: generateIdFromEntropySize(10),
            email: githubData?.email,
            name: githubData.name || "",
            profileImageUrl: githubData.avatar_url || null,
            username: githubData.login,
            isEmailVerified: true,
            OAuthAccount: {
              create: {
                provider: "github",
                providerAccountId: githubData.id.toString(), // Convert to string
                accessToken: accessToken,
              },
            },
          },
          include: {
            OAuthAccount: true,
          },
        });
      } else {
        // Update existing user information
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            name: githubData.name || user.name,
            profileImageUrl: githubData.avatar_url || user.profileImageUrl,
            OAuthAccount: {
              upsert: {
                where: {
                  id: user.OAuthAccount[0]?.id || "",
                },
                create: {
                  provider: "github",
                  providerAccountId: githubData.id.toString(), // Convert to string
                  accessToken: accessToken,
                },
                update: {
                  accessToken: accessToken,
                },
              },
            },
          },
          include: {
            OAuthAccount: true,
          },
        });
      }

      return user;
    });

    // Create a new session for the authenticated user
    const session = await lucia.createSession(result.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Clear the state and codeVerifier cookies
    cookies().set("state", "", {
      expires: new Date(0),
    });

    // Redirect to the dashboard upon successful authentication
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error: unknown) {
    // Handle any errors during the authentication process
    console.error("Error during Google OAuth:", error);
    return Response.json(
      { error: "An error occurred during authentication." },
      { status: 500 },
    );
  }
};
