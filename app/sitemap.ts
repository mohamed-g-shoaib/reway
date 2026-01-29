import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: "https://reway.vercel.app/",
      lastModified,
    },
    {
      url: "https://reway.vercel.app/login",
      lastModified,
    },
  ];
}
