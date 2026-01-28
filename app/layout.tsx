import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://reway.vercel.app"),
  title: {
    default: "Reway — A Calm Home for Everything You Save",
    template: "%s · Reway",
  },
  description:
    "Reway turns messy links into a structured, searchable library with AI extraction, groups, keyboard navigation, and flexible views.",
  alternates: {
    canonical: "https://reway.vercel.app/",
  },
  openGraph: {
    title: "Reway — A Calm Home for Everything You Save",
    description:
      "Capture anything, let AI extract what matters, and move fast with groups, keyboard navigation, and flexible views.",
    url: "https://reway.vercel.app/",
    siteName: "Reway",
    type: "website",
    images: [
      {
        url: "https://reway.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "Reway — A calm home for everything you save",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reway — A Calm Home for Everything You Save",
    description:
      "Capture anything, let AI extract what matters, and move fast with groups, keyboard navigation, and flexible views.",
    images: ["https://reway.vercel.app/api/og"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={400}>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
