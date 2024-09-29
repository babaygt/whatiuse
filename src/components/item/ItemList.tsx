"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { deleteItem } from "@/app/actions/item";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Alert from "@/components/Alert";
import { ItemFormDialog } from "@/components/item/ItemFormDialog";
import { Item, Category } from "@/types";

type ItemListProps = {
  items: Item[];
  categories: Category[];
  isOwnProfile: boolean;
};

export function ItemList({
  items,
  categories,
  isOwnProfile,
}: ItemListProps & { isOwnProfile: boolean }) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    const handleCategoryChange = (event: CustomEvent) => {
      setSelectedCategory(event.detail);
    };

    window.addEventListener(
      "categoryChange",
      handleCategoryChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "categoryChange",
        handleCategoryChange as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredItems(items);
    } else {
      setFilteredItems(
        items.filter((item) => item.category.name === selectedCategory),
      );
    }
  }, [selectedCategory, items]);

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      setFilteredItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId),
      );
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
    setShowDeleteAlert(false);
    setItemToDelete(null);
  };

  return (
    <>
      <Alert
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        action={() => itemToDelete && handleDeleteItem(itemToDelete)}
        actionText="Delete"
        open={showDeleteAlert}
        setOpen={setShowDeleteAlert}
      />
      <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="flex h-full flex-col overflow-hidden hover:shadow-lg"
          >
            <CardContent className="flex flex-grow flex-col p-4">
              <div className="flex flex-col sm:flex-row">
                {item.image && (
                  <div className="relative mb-4 h-48 w-full sm:mb-0 sm:h-48 sm:w-48 sm:flex-shrink-0 sm:self-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-grow flex-col sm:ml-4">
                  <div className="mb-2">
                    <h3 className="line-clamp-1 text-lg font-semibold">
                      {item.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {item.category.name}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mb-4 line-clamp-3 text-sm">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-auto space-y-2">
                    {item.url && (
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-primary hover:underline"
                      >
                        Learn More <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    )}
                    {item.affiliateLinks && item.affiliateLinks.length > 0 && (
                      <div className="text-sm">
                        <p className="mb-1 font-semibold">Where to Buy:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.affiliateLinks.map((link, index) => (
                            <Link
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary hover:underline"
                            >
                              Link {index + 1}{" "}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            {isOwnProfile && (
              <CardFooter className="flex justify-end space-x-2 border-t p-4">
                <ItemFormDialog
                  item={item}
                  categories={categories}
                  onUpdateSuccess={(updatedItem) => {
                    setFilteredItems((prevItems) =>
                      prevItems.map((prevItem) =>
                        prevItem.id === item.id
                          ? {
                              ...prevItem,
                              ...updatedItem,
                              category: { name: updatedItem.category },
                              affiliateLinks: updatedItem.affiliateLinks,
                            }
                          : prevItem,
                      ),
                    );
                  }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setItemToDelete(item.id);
                    setShowDeleteAlert(true);
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
