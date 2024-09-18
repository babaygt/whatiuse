"use client";

import Link from "next/link";
import { DarkLightModeToggle } from "@/components/DarkLightModeToggle";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-10 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary">What I Use</h1>
        </Link>
        <div className="flex items-center gap-2">
          <DarkLightModeToggle />
        </div>
      </div>
    </header>
  );
}
