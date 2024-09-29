import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddItemSection } from "@/components/item/AddItemSection";
import { CategorySelector } from "@/components/CategorySelector";
import { ItemList } from "@/components/item/ItemList";
import {
  FaInstagram,
  FaGithub,
  FaGlobe,
  FaLink,
  FaLinkedin,
  FaYoutube,
  FaPinterest,
  FaFacebook,
  FaTiktok,
  FaMedium,
} from "react-icons/fa";
import { FaBluesky, FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
        orderBy: {
          createdAt: "desc",
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
      <div className="mb-12 rounded-lg border-2 border-primary/20 bg-card p-4 shadow-md">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-x-8 sm:space-y-0">
          <div className="flex flex-col items-center sm:flex-row sm:space-x-8">
            {profileUser.profileImageUrl && (
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileUser.profileImageUrl || undefined} />
                <AvatarFallback>
                  {profileUser.name
                    ? profileUser.name.charAt(0)
                    : profileUser.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                <p className="text-lg text-muted-foreground">
                  @{profileUser.username}
                </p>
              </div>
              {profileUser.bio && (
                <p className="mt-2 text-muted-foreground">{profileUser.bio}</p>
              )}
              {profileUser.socialLinks.length > 0 && (
                <div className="mt-4 flex justify-center space-x-4 sm:justify-start">
                  {profileUser.socialLinks.map((link) => {
                    let Icon;
                    let bgColor;
                    switch (link.platform) {
                      case "twitter":
                        Icon = FaXTwitter;
                        bgColor = "bg-blue-400";
                        break;
                      case "instagram":
                        Icon = FaInstagram;
                        bgColor = "bg-pink-500";
                        break;
                      case "github":
                        Icon = FaGithub;
                        bgColor = "bg-gray-800";
                        break;
                      case "website":
                        Icon = FaGlobe;
                        bgColor = "bg-green-500";
                        break;
                      case "linkedin":
                        Icon = FaLinkedin;
                        bgColor = "bg-blue-700";
                        break;
                      case "youtube":
                        Icon = FaYoutube;
                        bgColor = "bg-red-600";
                        break;
                      case "pinterest":
                        Icon = FaPinterest;
                        bgColor = "bg-red-700";
                        break;
                      case "bluesky":
                        Icon = FaBluesky;
                        bgColor = "bg-sky-500";
                        break;
                      case "facebook":
                        Icon = FaFacebook;
                        bgColor = "bg-blue-600";
                        break;
                      case "tiktok":
                        Icon = FaTiktok;
                        bgColor = "bg-black";
                        break;
                      case "medium":
                        Icon = FaMedium;
                        bgColor = "bg-green-700";
                        break;
                      default:
                        Icon = FaLink;
                        bgColor = "bg-gray-500";
                    }
                    return (
                      <Link
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-white transition-transform hover:scale-110",
                          bgColor,
                        )}
                        title={
                          predefinedPlatforms.includes(link.platform)
                            ? link.platform
                            : `Custom: ${link.platform}`
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <div className="flex flex-col space-y-2">
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
