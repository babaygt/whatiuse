"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateUser(formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const bio = formData.get("bio") as string;
  const profileImageUrl = formData.get("profileImageUrl") as string;
  const socialLinks = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("socialLinks"))
    .reduce(
      (acc, [key, value]) => {
        const [, index, field] =
          key.match(/socialLinks\[(\d+)\]\[(\w+)\]/) || [];
        if (index && field) {
          acc[Number(index)] = { ...acc[Number(index)], [field]: value };
        }
        return acc;
      },
      [] as { platform: string; url: string }[],
    );

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      username,
      email,
      bio,
      profileImageUrl,
      socialLinks: {
        deleteMany: {},
        create: socialLinks,
      },
    },
    include: {
      socialLinks: true,
    },
  });

  revalidatePath(`/${updatedUser.username}`);
  return { updatedUser, oldUsername: user.username };
}

export async function getCurrentUser() {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      socialLinks: true,
    },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  return currentUser;
}
