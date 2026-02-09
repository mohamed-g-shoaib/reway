import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DemoVideosSection } from "@/components/landing/DemoVideosSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/LandingFooter";
import type { DashboardHref } from "@/components/landing/types";

interface LandingPageProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

export default function LandingPage({
  dashboardHref,
  ctaLabel,
}: LandingPageProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingNav dashboardHref={dashboardHref} ctaLabel={ctaLabel} />
      <main className="pt-20">
        <HeroSection dashboardHref={dashboardHref} ctaLabel={ctaLabel} />
        <FeaturesSection />
        <DemoVideosSection />
        <CallToAction dashboardHref={dashboardHref} ctaLabel={ctaLabel} />
      </main>
      <LandingFooter />
    </div>
  );
}
