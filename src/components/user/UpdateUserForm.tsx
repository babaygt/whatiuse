"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUser } from "@/app/actions/user";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";

const updateUserSchema = z.object({
  name: z.string(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  bio: z.string().max(340).optional(),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url(),
    }),
  ),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface UpdateUserFormProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    email: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    socialLinks: { platform: string; url: string }[];
  };
  onUpdateSuccess: () => void;
}

const predefinedPlatforms = [
  "twitter",
  "instagram",
  "github",
  "website",
  "linkedin",
  "youtube",
  "pinterest",
  "bluesky",
  "facebook",
  "tiktok",
  "medium",
];

export function UpdateUserForm({ user, onUpdateSuccess }: UpdateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [bioLength, setBioLength] = useState(0);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username,
      email: user.email || "",
      bio: user.bio || "",
      profileImageUrl: user.profileImageUrl || "",
      socialLinks: user.socialLinks,
    },
  });

  const onSubmit = async (data: UpdateUserFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "socialLinks" && Array.isArray(value)) {
          value.forEach((link, index) => {
            formData.append(`socialLinks[${index}][platform]`, link.platform);
            formData.append(`socialLinks[${index}][url]`, link.url);
          });
        } else {
          formData.append(key, value as string);
        }
      });

      const { updatedUser, oldUsername } = await updateUser(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated.",
        variant: "success",
      });

      // Check if the username has changed
      if (updatedUser.username !== oldUsername) {
        // Redirect to the new profile page
        window.location.href = `/${updatedUser.username}`;
      } else {
        onUpdateSuccess();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setBioLength(form.getValues("bio")?.length || 0);
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    {...field}
                    placeholder="Bio"
                    onChange={(e) => {
                      field.onChange(e);
                      setBioLength(e.target.value.length);
                    }}
                    className={cn(
                      bioLength > 340 &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute bottom-2 right-2 text-xs",
                      bioLength > 340 ? "text-red-500" : "text-gray-400",
                    )}
                  >
                    {bioLength}/340
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    {...field}
                    value={uploadedImageUrl || field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      setUploadedImageUrl(null);
                    }}
                    placeholder="https://example.com/profile-image.jpg"
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
        <div className="space-y-4">
          {form.watch("socialLinks").map((_, index) => (
            <div key={index} className="space-y-2 rounded-md border p-4">
              <FormField
                control={form.control}
                name={`socialLinks.${index}.platform`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "custom") {
                          form.setValue(`socialLinks.${index}.platform`, "");
                        }
                      }}
                      value={
                        predefinedPlatforms.includes(field.value)
                          ? field.value
                          : "custom"
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {predefinedPlatforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform.charAt(0).toUpperCase() +
                              platform.slice(1)}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!predefinedPlatforms.includes(
                form.watch(`socialLinks.${index}.platform`),
              ) && (
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.platform`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Platform Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name={`socialLinks.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentLinks = form.getValues("socialLinks");
                  form.setValue(
                    "socialLinks",
                    currentLinks.filter((_, i) => i !== index),
                  );
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          className="w-full bg-yellow-500 hover:bg-yellow-500/90"
          onClick={() => {
            const currentLinks = form.getValues("socialLinks");
            form.setValue("socialLinks", [
              ...currentLinks,
              { platform: "twitter", url: "" },
            ]);
          }}
        >
          Add Social Link
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
