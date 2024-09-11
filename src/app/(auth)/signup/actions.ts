"use server";

import { signUpSchema, SignUpSchema } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import prisma from "@/lib/db";
import { isRedirectError } from "next/dist/client/components/redirect";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function signUp(credentials: SignUpSchema): Promise<{
  error?: string;
  success?: boolean;
}> {
  try {
    const { email, password, username } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return { error: "Username already taken." };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return { error: "Email already taken." };
    }

    await prisma.user.create({
      data: {
        id: userId,
        email,
        username,
        hashedPassword: passwordHash,
      },
    });

    // generate a random string of 6 characters code
    const code = crypto.randomBytes(6).toString("hex");

    await prisma.emailVerification.create({
      data: {
        userId,
        code,
        sentAt: new Date(),
      },
    });

    const token = jwt.sign({ email, code }, process.env.JWT_SECRET!, {
      expiresIn: "5m",
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}`;

    // Send verification email
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          username,
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

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
