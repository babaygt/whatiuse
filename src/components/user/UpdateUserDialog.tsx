"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UpdateUserForm } from "./UpdateUserForm";
import { getCurrentUser } from "@/app/actions/user";
import { User } from "@/types";
import { FiEdit } from "react-icons/fi";
import { toast } from "@/hooks/use-toast";

export function UpdateUserDialog() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Failed to fetch user data",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
    setOpen(isOpen);
  };

  const handleUpdateSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-yellow-500 text-black hover:bg-yellow-600"
        >
          <FiEdit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[425px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2">
          {user && (
            <UpdateUserForm user={user} onUpdateSuccess={handleUpdateSuccess} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
