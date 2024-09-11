import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "@/lib/oauth";
import prisma from "@/lib/db";
import { lucia } from "@/auth";
import { generateIdFromEntropySize } from "lucia";

// Define the structure of Google user information
interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  picture: string;
  locale: string;
}

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

    // Retrieve codeVerifier and storedState from cookies
    const codeVerifier = cookies().get("codeVerifier")?.value;
    const storedState = cookies().get("state")?.value;

    // Validate the presence of codeVerifier and storedState
    if (!codeVerifier || !storedState) {
      return Response.json(
        { error: "No codeVerifier or state found. Invalid request." },
        { status: 400 },
      );
    }

    // Verify that the received state matches the stored state
    if (storedState !== state) {
      return Response.json(
        { error: "Invalid state. Request may have been tampered with." },
        { status: 400 },
      );
    }

    // Validate the authorization code and get tokens
    const { accessToken, refreshToken, accessTokenExpiresAt } =
      await google.validateAuthorizationCode(code, codeVerifier);

    // Fetch user information from Google API
    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "GET",
      },
    );

    const googleData = (await googleRes.json()) as GoogleUserInfo;

    // Ensure email is provided by Google
    if (!googleData.email) {
      console.error("No email provided by Google. Full response:", googleData);
      return Response.json(
        { error: "Unable to retrieve email from Google." },
        { status: 500 },
      );
    }

    // Perform database operations within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find existing user or create a new one
      let user = await tx.user.findFirst({
        where: {
          email: googleData.email,
        },
        include: {
          OAuthAccount: {
            where: {
              provider: "google",
            },
          },
        },
      });

      if (!user) {
        // Create new user if not found
        user = await tx.user.create({
          data: {
            id: generateIdFromEntropySize(10),
            email: googleData.email,
            name: googleData.name || "",
            profileImageUrl: googleData.picture || null,
            username: googleData.email.split("@")[0],
            isEmailVerified: googleData.verified_email,
            OAuthAccount: {
              create: {
                provider: "google",
                providerAccountId: googleData.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresAt: accessTokenExpiresAt,
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
            name: googleData.name || user.name,
            profileImageUrl: googleData.picture || user.profileImageUrl,
            OAuthAccount: {
              upsert: {
                where: {
                  id: user.OAuthAccount[0]?.id || "",
                },
                create: {
                  provider: "google",
                  providerAccountId: googleData.id,
                  accessToken: accessToken,
                  refreshToken: refreshToken,
                  expiresAt: accessTokenExpiresAt,
                },
                update: {
                  accessToken: accessToken,
                  refreshToken: refreshToken,
                  expiresAt: accessTokenExpiresAt,
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
    cookies().set("codeVerifier", "", {
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
