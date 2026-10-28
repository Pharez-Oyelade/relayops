"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Receipt, Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/ui/stagger-children";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="w-full bg-background py-20 sm:py-24 px-6 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <MotionWrapper variant="fadeUp">
          <Eyebrow
            icon={
              <Receipt className="h-3.5 w-3.5 text-foreground stroke-[1.5]" />
            }
            className="mb-6"
          >
            Simple Pricing
          </Eyebrow>
        </MotionWrapper>

        {/* Headline */}
        <MotionWrapper variant="fadeUp" delay={0.05}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 text-center">
            Pick your lane
          </h2>
        </MotionWrapper>

        {/* Subheadline */}
        <MotionWrapper variant="fadeUp" delay={0.1}>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center font-normal">
            No per-seat surprises. Every plan includes the complete relay from
            lead capture to deliverable approval and instant payment.
          </p>
        </MotionWrapper>

        {/* Billing Toggle */}
        <MotionWrapper variant="fadeUp" delay={0.15}>
          <div className="mt-8 flex items-center justify-center">
            <div className="inline-flex items-center rounded-lg bg-zinc-100 p-1 border border-zinc-200">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                  !isAnnual
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                  isAnnual
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Annual
                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </MotionWrapper>

        {/* Pricing Cards */}
        <StaggerChildren
          className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl items-stretch"
          staggerDelay={0.1}
        >
          {/* Card 1: Starter */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full rounded-xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-zinc-300 transition-colors duration-150"
            >
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Starter</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  For freelancers and solo consultants
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-zinc-900 tracking-tight">
                    ${isAnnual ? "23" : "29"}
                  </span>
                  <span className="text-sm text-zinc-500 font-normal">/ month</span>
                </div>
                {isAnnual && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Billed annually ($276/yr)
                  </p>
                )}

                <div className="mt-8 pt-6 border-t border-zinc-100 space-y-3">
                  {[
                    "3 active projects",
                    "5 client portals",
                    "Deliverable tracking & approvals",
                    "Direct Paystack invoicing",
                    "Email support",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-sm text-zinc-600">
                      <Check className="h-4 w-4 text-zinc-400 stroke-[2] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/register"
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 transition-all duration-150 active:scale-[0.98]"
                >
                  Start Free
                </Link>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Card 2: Pro (Highlighted) */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="relative flex flex-col justify-between h-full rounded-xl border-2 border-primary bg-white p-7 shadow-xs"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                  Most Popular
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-zinc-900">Pro</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  For growing studios and agile teams
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-zinc-900 tracking-tight">
                    ${isAnnual ? "63" : "79"}
                  </span>
                  <span className="text-sm text-zinc-500 font-normal">/ month</span>
                </div>
                {isAnnual && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Billed annually ($756/yr)
                  </p>
                )}

                <div className="mt-8 pt-6 border-t border-zinc-100 space-y-3">
                  {[
                    "15 active projects",
                    "Unlimited client portals",
                    "Advanced deliverable workflows",
                    "Automated sign-off & invoice triggers",
                    "Team collaboration (up to 5 seats)",
                    "Custom client portal branding",
                    "Priority support",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-sm text-zinc-800">
                      <Check className="h-4 w-4 text-primary stroke-[2.5] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/register"
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.98]"
                >
                  Start Free Trial
                </Link>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Card 3: Agency */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full rounded-xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-zinc-300 transition-colors duration-150"
            >
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Agency</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  For established agencies and scaled operations
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-zinc-900 tracking-tight">
                    ${isAnnual ? "159" : "199"}
                  </span>
                  <span className="text-sm text-zinc-500 font-normal">/ month</span>
                </div>
                {isAnnual && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Billed annually ($1,908/yr)
                  </p>
                )}

                <div className="mt-8 pt-6 border-t border-zinc-100 space-y-3">
                  {[
                    "Everything in Pro",
                    "Unlimited projects & team seats",
                    "Custom domain for client portals",
                    "Full audit logs & governance",
                    "Custom invoice templates",
                    "Dedicated onboarding manager",
                    "99.9% uptime SLA",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-sm text-zinc-600">
                      <Check className="h-4 w-4 text-zinc-400 stroke-[2] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/register"
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 transition-all duration-150 active:scale-[0.98]"
                >
                  Contact Sales
                </Link>
              </div>
            </motion.div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
