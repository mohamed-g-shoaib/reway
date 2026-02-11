import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: "https://reway-app.vercel.app/",
      lastModified,
    },
    {
      url: "https://reway-app.vercel.app/login",
      lastModified,
    },
  ];
}
