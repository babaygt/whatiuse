"use server";

import prisma from "@/lib/db";
import { hash } from "@node-rs/argon2";
import jwt from "jsonwebtoken";

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{
  error?: string;
  success?: boolean;
}> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      resetToken: string;
    };

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { passwordResetToken: true },
    });

    if (
      !user ||
      !user.passwordResetToken ||
      user.passwordResetToken.token !== decoded.resetToken
    ) {
      return { error: "Invalid or expired reset token" };
    }

    if (user.passwordResetToken.expiresAt < new Date()) {
      return { error: "Reset token has expired" };
    }

    const passwordHash = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { hashedPassword: passwordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { id: user.passwordResetToken.id },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
