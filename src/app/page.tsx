"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Laptop, Share2, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <main className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="block text-primary">What I Use</span>
          <span className="block text-gray-600 dark:text-gray-400">
            Share Your Tools & Resources
          </span>
        </h1>
        <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl">
          Showcase the tools, apps, and gear that power your workflow. Connect
          with others and discover new resources.
        </p>
        <div className="mt-8 flex justify-center">
          {loading ? (
            <Button size="lg" disabled>
              Loading...
            </Button>
          ) : user ? (
            <Link href={`/${user.username}`}>
              <Button size="lg">
                Go to Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg" className="mr-4">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Log In
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>

      <section className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<Laptop className="h-8 w-8 text-primary" />}
          title="Showcase Your Setup"
          description="Create a beautiful profile of all the tools and resources you use daily."
        />
        <FeatureCard
          icon={<Share2 className="h-8 w-8 text-primary" />}
          title="Share with Others"
          description="Easily share your profile with friends, colleagues, or your audience."
        />
        <FeatureCard
          icon={<Users className="h-8 w-8 text-primary" />}
          title="Discover New Tools"
          description="Explore what others are using and find new tools to enhance your workflow."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      {icon}
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
