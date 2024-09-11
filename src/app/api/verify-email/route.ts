import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return Response.json({ error: "No token provided" }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      code: string;
    };

    const user = await prisma.user.findFirst({
      where: {
        email: decoded.email,
      },
      include: {
        EmailVerification: {
          where: {
            code: decoded.code,
          },
        },
      },
    });

    if (!user || !user.EmailVerification) {
      return Response.json(
        { error: "User not found or verification token invalid" },
        { status: 400 },
      );
    }

    // Update user and email verification status
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
      prisma.emailVerification.delete({
        where: { id: user.EmailVerification[0].id },
      }),
    ]);

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Use Response.redirect() here
    return Response.redirect(new URL("/email-verified", req.url));
  } catch (error) {
    // This is already working as expected
    return Response.redirect(new URL("/email-verification-failed", req.url));
  }
};
