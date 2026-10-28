"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Users } from "lucide-react";
import { motion, useInView, animate } from "motion/react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const FEATURES = [
  {
    title: "Real-time project status",
    description: "Clients see progress as it happens, without asking",
  },
  {
    title: "One-click deliverable approval",
    description: "Review, comment, and sign off from a single screen",
  },
  {
    title: "Integrated invoice payment",
    description: "Pay directly through the portal via Paystack",
  },
  {
    title: "File downloads & asset library",
    description: "All project files organized and accessible",
  },
] as const;

function ClientPortalPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });
  const [progress, setProgress] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const hasAnimated = useRef(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animate progress bar gradually from 0% to 60% on initial scroll-in
  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(0, 60, {
        duration: 1.5,
        delay: 0.3,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (val) => setProgress(Math.round(val)),
      });
      return () => controls.stop();
    }
  }, [isInView]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Interactive toggle: clicking the second deliverable marks it approved and animates to 100%
  const handleToggleDeliverable = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    if (!isApproved) {
      setIsApproved(true);
      const controls = animate(progress, 100, {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (val) => setProgress(Math.round(val)),
      });

      // Automatically reset back to 60% after 3.5s timeout
      resetTimerRef.current = setTimeout(() => {
        setIsApproved(false);
        animate(100, 60, {
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (val) => setProgress(Math.round(val)),
        });
      }, 3500);

      return () => controls.stop();
    } else {
      setIsApproved(false);
      const controls = animate(progress, 60, {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (val) => setProgress(Math.round(val)),
      });
      return () => controls.stop();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      data-ui
      className="rounded-lg border border-zinc-200 bg-white shadow-xs p-5 sm:p-6 space-y-5 transition-colors duration-150 hover:border-zinc-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">
          Project: Brand Refresh
        </h3>
        {isApproved ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 transition-all duration-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Complete ✓
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 transition-all duration-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            On Track
          </span>
        )}
      </div>

      {/* Progress bar — fills up gradually from 0% */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Overall progress</span>
          <span className="font-semibold text-zinc-800 font-mono transition-colors duration-150">
            {progress}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-0 divide-y divide-zinc-100">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-zinc-700">Homepage Mockups</span>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded">
            Approved ✓
          </span>
        </div>

        {/* Interactive line item */}
        <button
          type="button"
          onClick={handleToggleDeliverable}
          className="w-full flex items-center justify-between py-3 text-left hover:bg-zinc-50/80 rounded px-1 -mx-1 transition-colors duration-150 cursor-pointer group"
          title="Click to simulate client approval"
        >
          <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors cursor-pointer">
            Brand Guidelines v2
          </span>
          {isApproved ? (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded transition-all duration-200">
              Approved ✓
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded transition-all duration-200 group-hover:bg-amber-200/80">
              Awaiting Review
            </span>
          )}
        </button>
      </div>

      {/* Footer link */}
      <div className="pt-1 flex items-center justify-between">
        <a
          href="#"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-150"
        >
          View Full Portal →
        </a>
      </div>
    </motion.div>
  );
}

export default function ClientPortalSection() {
  return (
    <section className="w-full bg-background py-20 sm:py-24 px-6 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <MotionWrapper variant="fadeUp">
          <Eyebrow
            icon={
              <Users className="h-3.5 w-3.5 text-foreground stroke-[1.5]" />
            }
            className="mb-6"
          >
            The Client Experience
          </Eyebrow>
        </MotionWrapper>

        {/* Headline */}
        <MotionWrapper variant="fadeUp" delay={0.05}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 text-center">
            A dedicated portal for every client
          </h2>
        </MotionWrapper>

        {/* Subheadline */}
        <MotionWrapper variant="fadeUp" delay={0.1}>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center font-normal">
            No more &ldquo;check your email for the latest version&rdquo;.
            Clients see exactly what they need&nbsp;&mdash; and nothing they
            don&apos;t.
          </p>
        </MotionWrapper>

        {/* Split layout */}
        <div className="mt-12 sm:mt-16 w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left — Feature checklist */}
          <div className="w-full lg:w-1/2">
            <StaggerChildren
              className="flex flex-col gap-6"
              staggerDelay={0.08}
            >
              {FEATURES.map((feature) => (
                <StaggerItem key={feature.title}>
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="h-5 w-5 text-primary stroke-[1.5] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {feature.title}
                      </p>
                      <p className="text-sm text-zinc-600 mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          {/* Right — Portal UI fragment with gradual progress animation */}
          <div className="w-full lg:w-1/2">
            <MotionWrapper variant="scaleIn" delay={0.15}>
              <ClientPortalPreview />
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
