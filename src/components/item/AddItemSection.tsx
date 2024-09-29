"use client";

import { ItemFormDialog } from "@/components/item/ItemFormDialog";
import { Category } from "@/types";
import { UpdateUserDialog } from "@/components/user/UpdateUserDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FiKey } from "react-icons/fi"; // Import icons from react-icons

interface AddItemSectionProps {
  categories: Category[];
  isOwnProfile: boolean;
}

export function AddItemSection({
  categories,
  isOwnProfile,
}: AddItemSectionProps) {
  if (!isOwnProfile) return null;

  return (
    <div className="flex flex-col space-y-4">
      <UpdateUserDialog />
      <Link href="/reset-password" className="w-full">
        <Button size="sm" className="bg-red-500 text-black hover:bg-red-600">
          <FiKey className="mr-2 h-4 w-4" />
          Reset Password
        </Button>
      </Link>
      <ItemFormDialog categories={categories} />
    </div>
  );
}
