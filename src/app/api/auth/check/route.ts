import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      isEmailVerified: user.isEmailVerified,
    },
  });
}
