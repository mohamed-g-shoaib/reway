import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DemoVideosSection } from "@/components/landing/DemoVideosSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function DemoLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="pt-12">
        <HeroSection dashboardHref="/dashboard" ctaLabel="Dashboard" />
        <FeaturesSection />
        <DemoVideosSection />
        <div id="about" />
        <CallToAction dashboardHref="/dashboard" ctaLabel="Dashboard" />
      </main>
      <LandingFooter />
    </div>
  );
}
