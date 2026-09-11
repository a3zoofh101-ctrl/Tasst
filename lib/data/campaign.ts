import { CampaignConfig } from "@/lib/types";

/**
 * Edit this single file to update the National Day (or any seasonal) campaign
 * across the whole site — hero banner, offers page, and product badges.
 * No rebuild logic required: change values, redeploy the content.
 */
export const nationalDayCampaign: CampaignConfig = {
  enabled: true,
  slug: "national-day",
  image:
    "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1600&q=80",
  mobileImage:
    "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=900&q=80",
  title: {
    ar: "عروض اليوم الوطني السعودي 🇸🇦",
    en: "Saudi National Day Offers 🇸🇦"
  },
  subtitle: {
    ar: "احتفل معنا بخصومات تصل إلى 30% على عطور مختارة من لادورتي",
    en: "Celebrate with us — up to 30% off selected L'ADOUR fragrances"
  },
  discountPercent: 30,
  promoCode: "SA95",
  endsAt: "2026-09-23T23:59:59+03:00",
  productIds: ["p-london", "p-miami", "p-tokyo"],
  theme: {
    primary: "#0B5D3B",
    accent: "#B08B4F"
  }
};
