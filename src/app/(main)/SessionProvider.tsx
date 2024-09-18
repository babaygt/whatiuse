"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export default function SessionProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-20 animate-spin" />
      </div>
    );
  }

  if (
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/signup")
  ) {
    router.push("/login");
    return null;
  }

  return <>{children}</>;
}
