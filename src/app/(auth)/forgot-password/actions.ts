"use server";

import prisma from "@/lib/db";
import { generateIdFromEntropySize } from "lucia";
import jwt from "jsonwebtoken";

export async function sendPasswordResetEmail(email: string): Promise<{
  error?: string;
  success?: boolean;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether a user exists or not
      return { success: true };
    }

    const resetToken = generateIdFromEntropySize(10);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    const token = jwt.sign({ email, resetToken }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/forgot-password/reset?token=${token}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-reset-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          username: user.username,
          resetUrl,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Email sending error:", errorData);
      throw new Error(
        `Failed to send reset password email: ${errorData.error || response.statusText}`,
      );
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
