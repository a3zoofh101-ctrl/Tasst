import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "http://localhost:3000";

  return [
    { url: `${base}/smm`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/smm/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/smm/privacy`, changeFrequency: "yearly", priority: 0.3 }
  ];
}
