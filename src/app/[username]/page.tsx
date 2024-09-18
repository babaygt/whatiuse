import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddItemSection } from "@/components/item/AddItemSection";
import { CategorySelector } from "@/components/CategorySelector";
import { ItemList } from "@/components/item/ItemList";
import { FaTwitter, FaInstagram, FaGithub, FaGlobe } from "react-icons/fa";
import Link from "next/link";

export default async function UserPage({
  params,
}: {
  params: { username: string };
}) {
  const { user } = await validateRequest();

  const profileUser = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      socialLinks: true,
      categories: true,
      items: {
        include: {
          category: true,
          affiliateLinks: true,
        },
      },
    },
  });

  if (!profileUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <h2 className="text-2xl font-bold text-primary">User Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profileUser.id;

  return (
    <div className="container mx-auto mt-8 max-w-6xl px-4">
      <div className="mb-12 rounded-lg bg-card p-8 shadow-md">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileUser.profileImageUrl || undefined} />
            <AvatarFallback>
              {profileUser.name
                ? profileUser.name.charAt(0)
                : profileUser.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profileUser.name}</h1>
            <p className="text-lg text-muted-foreground">
              @{profileUser.username}
            </p>
            {profileUser.bio && (
              <p className="mt-2 text-muted-foreground">{profileUser.bio}</p>
            )}
            <div className="mt-4 flex justify-center space-x-4 sm:justify-start">
              {profileUser.socialLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.platform === "twitter" && <FaTwitter />}
                  {link.platform === "instagram" && <FaInstagram />}
                  {link.platform === "github" && <FaGithub />}
                  {link.platform === "website" && <FaGlobe />}
                </Link>
              ))}
            </div>
          </div>
          {isOwnProfile && (
            <div className="mt-4 sm:mt-0">
              <AddItemSection
                categories={profileUser.categories}
                isOwnProfile={isOwnProfile}
              />
            </div>
          )}
        </div>
      </div>
      <CategorySelector
        categories={profileUser.categories}
        isOwnProfile={isOwnProfile}
      />
      <ItemList
        items={profileUser.items}
        categories={profileUser.categories}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
