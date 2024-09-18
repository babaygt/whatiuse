"use client";

import { ItemFormDialog } from "@/components/item/ItemFormDialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Category } from "@/types";

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
    <div className="flex space-x-4">
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Edit Profile
      </Button>
      <ItemFormDialog categories={categories} />
    </div>
  );
}
