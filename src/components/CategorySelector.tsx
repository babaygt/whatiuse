"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/actions/category";
import { useToast } from "@/hooks/use-toast";
import Alert from "@/components/Alert";

type Category = {
  id: string;
  name: string;
};

type CategorySelectorProps = {
  categories: Category[];
  isOwnProfile: boolean;
};

export function CategorySelector({
  categories,
  isOwnProfile,
}: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    window.dispatchEvent(
      new CustomEvent("categoryChange", { detail: category }),
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
      // Log the error or handle it as needed, but don't rethrow
      console.error("Error deleting category:", error);
    } finally {
      setShowDeleteAlert(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <Alert
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        action={() =>
          categoryToDelete && handleDeleteCategory(categoryToDelete)
        }
        actionText="Delete"
        open={showDeleteAlert}
        setOpen={setShowDeleteAlert}
      />
      <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryClick("All")}
        >
          All
        </Button>
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Button
              variant={
                selectedCategory === category.name ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.name}
            </Button>
            {isOwnProfile && hoveredCategory === category.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryToDelete(category.id);
                  setShowDeleteAlert(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
