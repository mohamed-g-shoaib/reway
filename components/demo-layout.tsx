import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DemoVideosSection } from "@/components/landing/DemoVideosSection";
import { ExtensionInstallSection } from "@/components/landing/ExtensionInstallSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function DemoLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="pt-12">
        <HeroSection />
        <FeaturesSection />
        <DemoVideosSection />
        <ExtensionInstallSection />
        <div id="about" />
        <CallToAction />
      </main>
      <LandingFooter />
    </div>
  );
}
