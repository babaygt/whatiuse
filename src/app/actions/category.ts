"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteCategory(categoryId: string) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if the category exists and belongs to the user
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { user: true, items: true },
    });

    if (!category || category.user.id !== user.id) {
      throw new Error(
        "Category not found or you don't have permission to delete it",
      );
    }

    // Check if the category has associated items
    if (category.items.length > 0) {
      throw new Error("Cannot delete category with associated items");
    }

    // Delete the category
    await prisma.category.delete({ where: { id: categoryId } });

    revalidatePath(`/${user.username}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    } else {
      throw new Error(
        "An unexpected error occurred while deleting the category",
      );
    }
  }
}
