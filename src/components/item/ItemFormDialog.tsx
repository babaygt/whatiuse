"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit } from "lucide-react";
import { addItem, updateItem } from "@/app/actions/item";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/utils/uploadthing";
import { cn } from "@/lib/utils"; // Make sure you have this utility function

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(240).optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  affiliateLinks: z.array(z.string().url("Invalid affiliate URL")).optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

type ItemFormDialogProps = {
  item?: {
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    image: string | null;
    category: { name: string };
    affiliateLinks: { id: string; url: string }[];
  };
  categories: { id: string; name: string }[];
  onUpdateSuccess?: (updatedItem: {
    name: string;
    description: string;
    url: string;
    image: string;
    category: string;
    affiliateLinks: { id: string; url: string }[];
  }) => void;
};

export function ItemFormDialog({
  item,
  categories,
  onUpdateSuccess,
}: ItemFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description || "",
          url: item.url || "",
          image: item.image || "",
          category: item.category.name,
          affiliateLinks: item.affiliateLinks.map((link) => link.url),
        }
      : {
          name: "",
          description: "",
          url: "",
          image: "",
          category: "",
          affiliateLinks: [],
        },
  });

  useEffect(() => {
    setDescriptionLength(form.getValues("description")?.length || 0);
  }, [form]);

  const onSubmit = async (data: ItemFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "affiliateLinks") {
        (value as string[]).forEach((link) => {
          formData.append(`affiliateLinks[]`, link);
        });
      } else {
        formData.append(key, value as string);
      }
    });

    try {
      if (item) {
        const updatedItem = await updateItem(item.id, formData);
        toast({
          title: "Item updated",
          description: "Item updated successfully",
          variant: "success",
        });
        if (onUpdateSuccess) {
          onUpdateSuccess({
            name: updatedItem.name,
            description: updatedItem.description || "",
            url: updatedItem.url || "",
            image: updatedItem.image || "",
            category: updatedItem.category.name,
            affiliateLinks: updatedItem.affiliateLinks.map((link) => ({
              id: link.id,
              url: link.url,
            })),
          });
        }
        // Update form values with the latest data
        form.reset({
          name: updatedItem.name,
          description: updatedItem.description || "",
          url: updatedItem.url || "",
          image: updatedItem.image || "",
          category: updatedItem.category.name,
          affiliateLinks: updatedItem.affiliateLinks.map((link) => link.url),
        });
      } else {
        await addItem(formData);
        toast({
          title: "Item added",
          description: "Item added successfully",
          variant: "success",
        });
      }
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: item ? "Failed to update item" : "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = () => {
    if (newCategory) {
      categories.push({ id: Date.now().toString(), name: newCategory });
      form.setValue("category", newCategory);
      setNewCategory("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={item && "bg-yellow-500 hover:bg-yellow-500/90"}
        >
          {item ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? "Update Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {item
              ? "Update the details of your item."
              : "Add a new item to your profile."}{" "}
            Fill out the form below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Item description"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setDescriptionLength(e.target.value.length);
                          }}
                          className={cn(
                            descriptionLength > 240 &&
                              "border-red-500 focus-visible:ring-red-500",
                          )}
                        />
                        <div
                          className={cn(
                            "absolute bottom-2 right-2 text-xs",
                            descriptionLength > 240
                              ? "text-red-500"
                              : "text-gray-400",
                          )}
                        >
                          {descriptionLength}/240
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={uploadedImageUrl || field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setUploadedImageUrl(null);
                          }}
                        />
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              setUploadedImageUrl(res[0].url);
                              field.onChange(res[0].url);
                            }
                          }}
                          onUploadError={(error: Error) => {
                            console.error(error);
                            toast({
                              title: "Upload failed",
                              description: error.message,
                              variant: "destructive",
                            });
                          }}
                          className="ut-button:w-full ut-button:text-sm ut-button:font-medium"
                          appearance={{
                            button:
                              "bg-primary text-primary-foreground hover:bg-primary/90",
                            allowedContent: "text-zinc-500",
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="New category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button type="button" onClick={handleAddCategory}>
                  Add
                </Button>
              </div>
              <div>
                <FormLabel>Affiliate Links</FormLabel>
                <div className="space-y-2">
                  {form.watch("affiliateLinks")?.map((_, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`affiliateLinks.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Input
                                placeholder="https://affiliate-link.com"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentLinks =
                                  form.getValues("affiliateLinks") || [];
                                form.setValue(
                                  "affiliateLinks",
                                  currentLinks.filter((_, i) => i !== index),
                                );
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const currentLinks = form.getValues("affiliateLinks") || [];
                    form.setValue("affiliateLinks", [...currentLinks, ""]);
                  }}
                >
                  Add Affiliate Link
                </Button>
              </div>
              <Button className="w-full" type="submit">
                {item ? "Update Item" : "Add Item"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
