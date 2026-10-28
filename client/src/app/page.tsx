"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import Hero from "@/components/marketing/Hero";
import ProofStrip from "@/components/marketing/ProofStrip";
import ProblemSection from "@/components/marketing/ProblemSection";
import LifecycleSection from "@/components/marketing/LifecycleSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import ProductShowcase from "@/components/marketing/ProductShowcase";
import ClientPortalSection from "@/components/marketing/ClientPortalSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import PricingSection from "@/components/marketing/PricingSection";
import FAQSection from "@/components/marketing/FAQSection";
import FinalCTA from "@/components/marketing/FinalCTA";
import Footer from "@/components/marketing/Footer";

export default function PublicLandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Public Navigation Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm tracking-tight border border-border">
              RO
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              RelayOps
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-all duration-150 active:scale-[0.98]"
            >
              Login / Client Portal
            </Link>
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.98]"
            >
              {isAuthenticated ? "Enter Workspace" : "Get Started"}
              <ArrowRight className="ml-1.5 h-3.5 w-4 stroke-2" />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <Hero isAuthenticated={isAuthenticated} />

      {/* 2. Proof Strip Section */}
      <ProofStrip />

      {/* 3. Problem Section (Where the Baton Drops) */}
      <ProblemSection />

      {/* 4. Lifecycle Walkthrough (The Complete Relay) */}
      <LifecycleSection />

      {/* 5. Feature Highlights (Built for Your Workflow) */}
      <FeaturesSection />

      {/* 6. Product Showcase (Watch the Relay in Motion) */}
      <ProductShowcase />

      {/* 7. Client Portal Spotlight (The Client Experience) */}
      <ClientPortalSection />

      {/* 8. Testimonials Section (Teams That Never Drop the Baton) */}
      <TestimonialsSection />

      {/* 9. Pricing Preview Section (Pick Your Lane) */}
      <PricingSection />

      {/* 10. FAQ Section (Clear the Last Hurdle) */}
      <FAQSection />

      {/* 11. Final CTA Section (Ready to Never Drop the Baton?) */}
      <FinalCTA />

      {/* 12. Footer */}
      <Footer />
    </div>
  );
}
