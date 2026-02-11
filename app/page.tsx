import type { Metadata } from "next";
import { DemoLayout } from "@/components/demo-layout";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Reway | A Calm Home For Everything You Save",
  description:
    "Reway turns noisy links into a structured library. Capture anything in seconds, let AI extract what matters, and move fast with search, groups, and view modes that match the way you think.",
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
