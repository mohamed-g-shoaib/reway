import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://reway-app.vercel.app"),
  title: {
    default: "Reway — A Calm Home For Everything You Save",
    template: "%s | Reway",
  },
  description:
    "Reway turns noisy links into a structured library. Capture anything in seconds, let AI extract what matters, and move fast with search, groups, and view modes that match the way you think.",
  alternates: {
    canonical: "https://reway-app.vercel.app/",
  },
  openGraph: {
    title: "Reway — A Calm Home For Everything You Save",
    description:
      "Reway turns noisy links into a structured library. Capture anything in seconds, let AI extract what matters, and move fast with search, groups, and view modes that match the way you think.",
    url: "https://reway-app.vercel.app/",
    siteName: "Reway",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reway — A Calm Home For Everything You Save",
    description:
      "Reway turns noisy links into a structured library. Capture anything in seconds, let AI extract what matters, and move fast with search, groups, and view modes that match the way you think.",
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
      <body className="antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={300} skipDelayDuration={1000}>
            {children}
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
