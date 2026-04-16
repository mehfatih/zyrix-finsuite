import { Navbar }            from "@/components/home/Navbar";
import { HeroSection }        from "@/components/home/HeroSection";
import { StatsStrip }         from "@/components/home/StatsStrip";
import { ProblemSection }     from "@/components/home/ProblemSection";
import { SolutionSection }    from "@/components/home/SolutionSection";
import { FeaturesSection }    from "@/components/home/FeaturesSection";
import { AISection }          from "@/components/home/AISection";
import { WhyUsSection }       from "@/components/home/WhyUsSection";
import { ComplianceSection }  from "@/components/home/ComplianceSection";
import { PricingSection }     from "@/components/home/PricingSection";
import { IntegrationsSection } from "@/components/home/IntegrationsSection";
import { SectorsSection }     from "@/components/home/SectorsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ROICalculator }      from "@/components/home/ROICalculator";
import { FAQSection }         from "@/components/home/FAQSection";
import { CTASection }         from "@/components/home/CTASection";
import { Footer }             from "@/components/home/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsStrip />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <AISection />
        <WhyUsSection />
        <ComplianceSection />
        <PricingSection />
        <IntegrationsSection />
        <SectorsSection />
        <TestimonialsSection />
        <ROICalculator />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}