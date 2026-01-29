import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import type { DashboardHref } from "@/components/landing/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reway | AI Bookmarking, Organized",
  description:
    "Capture everything you save. Reway extracts links with AI, organizes by groups, and keeps your knowledge searchable.",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data?.user);
  const dashboardHref: DashboardHref = isAuthenticated
    ? "/dashboard"
    : "/login";
  const ctaLabel = isAuthenticated ? "Dashboard" : "Get Started";

  return <LandingPage dashboardHref={dashboardHref} ctaLabel={ctaLabel} />;
}
