import { Navbar } from "@/components/smm/marketing/Navbar";
import { Hero } from "@/components/smm/marketing/Hero";
import { PlatformsShowcase } from "@/components/smm/marketing/PlatformsShowcase";
import { PopularServices } from "@/components/smm/marketing/PopularServices";
import { HowItWorks } from "@/components/smm/marketing/HowItWorks";
import { Features } from "@/components/smm/marketing/Features";
import { Stats } from "@/components/smm/marketing/Stats";
import { PricingTeaser } from "@/components/smm/marketing/PricingTeaser";
import { FAQ } from "@/components/smm/marketing/FAQ";
import { CTA } from "@/components/smm/marketing/CTA";
import { Footer } from "@/components/smm/marketing/Footer";

export default function SmmLandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PlatformsShowcase />
        <PopularServices />
        <HowItWorks />
        <Features />
        <Stats />
        <PricingTeaser />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
