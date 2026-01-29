import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reway",
    short_name: "Reway",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b0b0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
