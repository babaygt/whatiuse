"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
import { addItem } from "@/app/actions/item";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  affiliateLinks: z.array(z.string().url("Invalid affiliate URL")).optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function AddItemDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      image: "",
      category: "",
    },
  });

  const onSubmit = async (data: ItemFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "affiliateLinks" && Array.isArray(value)) {
        value.forEach((link) => {
          formData.append(`affiliateLinks[]`, link);
        });
      } else {
        formData.append(key, value as string);
      }
    });

    try {
      await addItem(formData);
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Item added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your profile. Fill out the details below.
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
                      <Textarea placeholder="Item description" {...field} />
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
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
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
                  variant="outline"
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
              <Button type="submit">Add Item</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
