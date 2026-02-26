import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DemoVideosSection } from "@/components/landing/DemoVideosSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ScrollToTopButton } from "@/components/landing/ScrollToTopButton";

export function DemoLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="pt-12">
        <HeroSection />
        <FeaturesSection />
        <DemoVideosSection />
        <div id="about" />
        <CallToAction />
      </main>
      <ScrollToTopButton />
      <LandingFooter />
    </div>
  );
}
