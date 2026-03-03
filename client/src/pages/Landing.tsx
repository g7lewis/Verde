import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LiveMapSection } from "@/components/landing/LiveMapSection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CommunityStatsSection } from "@/components/landing/CommunityStatsSection";
import { FeatureShowcaseSection } from "@/components/landing/FeatureShowcaseSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <LiveMapSection />
      <LeaderboardSection />
      <HowItWorksSection />
      <CommunityStatsSection />
      <FeatureShowcaseSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
