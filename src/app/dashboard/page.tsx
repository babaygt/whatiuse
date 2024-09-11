"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/(logout)/actions";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const { toast } = useToast();
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Success",
      description: "You have been logged out",
    });
  };
  return (
    <div className="flex h-screen items-center justify-center">
      <Button onClick={handleSignOut}>Logout</Button>
    </div>
  );
}
