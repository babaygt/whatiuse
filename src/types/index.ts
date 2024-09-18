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
