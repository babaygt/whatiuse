"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function addItem(formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  const image = formData.get("image") as string;
  const category = formData.get("category") as string;
  const affiliateLinks = formData.getAll("affiliateLinks[]") as string[];

  let slug = generateSlug(name);
  let slugSuffix = 1;

  while (await prisma.item.findFirst({ where: { userId: user.id, slug } })) {
    slug = `${generateSlug(name)}-${slugSuffix}`;
    slugSuffix++;
  }

  const categorySlug = generateSlug(category);

  const newItem = await prisma.item.create({
    data: {
      name,
      description,
      url,
      image,
      slug,
      user: {
        connect: { id: user.id },
      },
      category: {
        connectOrCreate: {
          where: {
            userId_name: {
              userId: user.id,
              name: category,
            },
          },
          create: {
            name: category,
            slug: categorySlug,
            userId: user.id,
          },
        },
      },
      affiliateLinks: {
        create: affiliateLinks.filter(Boolean).map((url) => ({ url })),
      },
    },
    include: {
      category: true,
      affiliateLinks: true,
    },
  });

  revalidatePath(`/${user.username}`);
  return newItem;
}

export async function deleteItem(itemId: string) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { user: true },
  });

  if (!item || item.user.id !== user.id) {
    throw new Error("Item not found or you don't have permission to delete it");
  }

  // Delete associated affiliate links first
  await prisma.affiliateLink.deleteMany({
    where: { itemId: itemId },
  });

  // Now delete the item
  await prisma.item.delete({ where: { id: itemId } });

  revalidatePath(`/${user.username}`);
}

// Add this new function after the existing addItem function
export async function updateItem(itemId: string, formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  const image = formData.get("image") as string;
  const category = formData.get("category") as string;
  const affiliateLinks = formData.getAll("affiliateLinks[]") as string[];

  const categorySlug = generateSlug(category);

  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      name,
      description,
      url,
      image,
      category: {
        connectOrCreate: {
          where: {
            userId_name: {
              userId: user.id,
              name: category,
            },
          },
          create: {
            name: category,
            slug: categorySlug,
            userId: user.id,
          },
        },
      },
      affiliateLinks: {
        deleteMany: {},
        create: affiliateLinks.filter(Boolean).map((url) => ({ url })),
      },
    },
    include: {
      category: true,
      affiliateLinks: true,
    },
  });

  revalidatePath(`/${user.username}`);
  return updatedItem;
}
