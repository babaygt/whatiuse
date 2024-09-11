"use server";

import prisma from "@/lib/db";
import { signInSchema, SignInSchema } from "@/lib/validation";
import { verify } from "@node-rs/argon2";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { generateState, generateCodeVerifier } from "arctic";
import { google, github } from "@/lib/oauth";

export async function signIn(credentials: SignInSchema): Promise<{
  error?: string;
  success?: boolean;
  key?: string;
}> {
  try {
    const { email, password } = signInSchema.parse(credentials);

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user || !user.hashedPassword) {
      return { error: "Invalid email or password" };
    }

    const passwordMatch = await verify(user.hashedPassword, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!passwordMatch) {
      return { error: "Invalid email or password" };
    }

    if (user.isEmailVerified === false) {
      return {
        error: "Please verify your email first",
        key: "email_not_verified",
      };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return { success: true };
  } catch (error: unknown) {
    console.log(error);
    return { error: "Something went wrong. Please try again." };
  }
}

export const resendVerificationEmail = async (email: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.isEmailVerified) {
      return { error: "Email already verified" };
    }

    const existedCode = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
    });

    if (!existedCode) {
      return { error: "Code not found" };
    }

    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - existedCode.sentAt.getTime();
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));

    if (minutesDifference < 1) {
      return {
        error: "Email verification already sent. Please wait 1 minute.",
      };
    }

    // generate a random string of 6 characters code
    const code = crypto.randomBytes(6).toString("hex");

    const emailVerification = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
    });

    if (!emailVerification) {
      return { error: "Email verification not found" };
    }

    await prisma.emailVerification.update({
      where: { id: emailVerification.id },
      data: { code, sentAt: new Date() },
    });

    const token = jwt.sign({ email, code }, process.env.JWT_SECRET!, {
      expiresIn: "5m",
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          username: user.username,
          verificationUrl,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Email sending error:", errorData);
      throw new Error(
        `Failed to send verification email: ${errorData.error || response.statusText}`,
      );
    }

    console.log(verificationUrl);

    return { success: "Email verification sent" };
  } catch (error: unknown) {
    console.log(error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const createGoogleAuthorizationURL = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    cookies().set("state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const authorizationURL = await google.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      },
    );

    // Add prompt and access_type as query parameters
    const urlWithExtraParams = new URL(authorizationURL.toString());
    urlWithExtraParams.searchParams.append("prompt", "consent");
    urlWithExtraParams.searchParams.append("access_type", "offline");

    return { success: true, data: urlWithExtraParams.toString() };
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

export const createGitHubAuthorizationURL = async () => {
  try {
    const state = generateState();

    cookies().set("state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const authorizationURL = await github.createAuthorizationURL(state, {
      scopes: ["user:email"],
    });

    return { success: true, data: authorizationURL.toString() };
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
