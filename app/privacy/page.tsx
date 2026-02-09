import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";
import { DashboardHref } from "@/components/landing/types";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how we protect your privacy and handle your data at Reway.",
};

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data?.user);
  const dashboardHref: DashboardHref = isAuthenticated
    ? "/dashboard"
    : "/login";
  const ctaLabel = isAuthenticated ? "Dashboard" : "Get Started";

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingNav dashboardHref={dashboardHref} ctaLabel={ctaLabel} />

      <main className="mx-auto max-w-350 px-4 pt-32 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-4 text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: February 8, 2026
            </p>
          </div>

          <div className="prose prose-stone dark:prose-invert max-w-none space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                1. Data We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us when you
                create an account, save bookmarks, or communicate with us. This
                includes your email address and the URLs you save.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                2. How We Use Data
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use your data to provide and improve our services,
                specifically for extracting metadata from your saved links using
                AI and organizing your library. We do not sell your personal
                information to third parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                3. AI Processing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                When you save a link, our AI models process the public content
                of that URL to generate titles, descriptions, and categories.
                This processing is automated and focused solely on providing
                metadata for your personal use.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                4. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use industry-standard security measures to protect your data.
                Your bookmarks are private and only accessible to you through
                your authenticated account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                5. Your Choices
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You can access, update, or delete your saved links and account
                information at any time through your dashboard.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
