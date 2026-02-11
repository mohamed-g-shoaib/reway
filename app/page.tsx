import type { Metadata } from "next";
import { DemoLayout } from "@/components/demo-layout";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Reway | AI Bookmarking, Organized",
  description:
    "Capture everything you save. Reway extracts links with AI, organizes by groups, and keeps your knowledge searchable.",
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Reway — A calm home for everything you save",
      },
    ],
  },
  twitter: {
    images: ["/twitter-image.png"],
  },
};

export default function page() {
  return (
    <>
      <Header />
      <DemoLayout />
    </>
  );
}
