export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  image: string | null;
  category: {
    name: string;
  };
  affiliateLinks: AffiliateLink[];
}

export interface AffiliateLink {
  id: string;
  url: string;
}

export interface User {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  socialLinks: { platform: string; url: string }[];
}
