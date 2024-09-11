"use server";

import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/validation";
import prisma from "@/lib/db";
import { hash, verify } from "@node-rs/argon2";
import { validateRequest } from "@/auth";
import { lucia } from "@/auth";
import { cookies } from "next/headers";

export async function resetPassword(credentials: ResetPasswordSchema): Promise<{
  error?: string;
  success?: boolean;
  key?: string;
}> {
  try {
    const { password, newPassword, logoutFromAllDevices } =
      resetPasswordSchema.parse(credentials);

    const { user } = await validateRequest();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const userData = await prisma.user.findFirst({
      where: {
        id: user?.id,
      },
    });

    if (!userData || !userData.hashedPassword) {
      return { error: "User not found or invalid user data." };
    }

    const passwordMatch = await verify(userData.hashedPassword, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!passwordMatch) {
      return { error: "Invalid password" };
    }

    const passwordHash = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        hashedPassword: passwordHash,
      },
    });

    if (logoutFromAllDevices) {
      await prisma.session.deleteMany({
        where: {
          userId: userData.id,
        },
      });

      const session = await lucia.createSession(userData.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }

    return { success: true };
  } catch (error: unknown) {
    console.log(error);
    return { error: "Something went wrong. Please try again." };
  }
}
