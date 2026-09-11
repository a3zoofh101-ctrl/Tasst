export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: "tiktok" | "instagram" | "x" | "snapchat" | "whatsapp";
}

export const socialLinks: SocialLink[] = [
  { id: "instagram", label: "Instagram", href: "https://instagram.com/ladour.perfumes", icon: "instagram" },
  { id: "tiktok", label: "TikTok", href: "https://tiktok.com/@ladour.perfumes", icon: "tiktok" },
  { id: "x", label: "X", href: "https://x.com/ladourperfumes", icon: "x" },
  { id: "snapchat", label: "Snapchat", href: "https://snapchat.com/add/ladourperfumes", icon: "snapchat" },
  { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/966500000000", icon: "whatsapp" }
];
