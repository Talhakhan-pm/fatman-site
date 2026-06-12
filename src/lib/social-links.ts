export const socialLinks = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@fatmanparts",
    href: "https://www.instagram.com/fatmanparts/",
  },
  {
    id: "facebook",
    label: "Facebook",
    handle: "Fatman Parts",
    href: "https://www.facebook.com/fatmanparts",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@fatmanparts",
    href: "https://www.tiktok.com/@fatmanparts",
  },
  {
    id: "x",
    label: "X",
    handle: "@FatmanParts",
    href: "https://x.com/FatmanParts",
  },
] as const;

export const socialProfileUrls = socialLinks.map((link) => link.href);
