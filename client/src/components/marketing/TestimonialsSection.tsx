"use client";

/* Note: Placeholder testimonials for initial release. Replace with verified client quotes before launch. */

import { motion } from "motion/react";
import { MessageSquareQuote } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/ui/stagger-children";

const TESTIMONIALS = [
  {
    quote:
      "We used to lose hours every week chasing approvals over email. Now clients sign off directly in their portal, and invoices go out the same day.",
    name: "Sarah Chen",
    role: "Creative Director",
    company: "Pixel & Co Studio",
    initials: "SC",
  },
  {
    quote:
      "As a freelancer juggling 8 clients, I needed one place to track everything. RelayOps replaced my spreadsheet, my invoice app, and half my inbox.",
    name: "Marcus Rivera",
    role: "Independent Brand Strategist",
    company: "Studio Rivera",
    initials: "MR",
  },
  {
    quote:
      "The client portal alone saved us. Our clients stopped asking 'where are we on this?' because they can see it themselves in real-time.",
    name: "Amara Obi",
    role: "Operations Lead",
    company: "Relay Digital Agency",
    initials: "AO",
  },
] as const;

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-[#f8f9fa] py-20 sm:py-24 px-6 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <MotionWrapper variant="fadeUp">
          <Eyebrow
            icon={
              <MessageSquareQuote className="h-3.5 w-3.5 text-foreground stroke-[1.5]" />
            }
            className="mb-6 bg-white border-zinc-200 text-zinc-900"
          >
            Trusted by Teams
          </Eyebrow>
        </MotionWrapper>

        {/* Headline */}
        <MotionWrapper variant="fadeUp" delay={0.05}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 text-center">
            Teams that never drop the baton
          </h2>
        </MotionWrapper>

        {/* Subheadline */}
        <MotionWrapper variant="fadeUp" delay={0.1}>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center font-normal">
            See how freelancers, studios, and agencies use RelayOps to deliver
            client work without the chaos.
          </p>
        </MotionWrapper>

        {/* Cards */}
        <StaggerChildren
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full"
          staggerDelay={0.1}
        >
          {TESTIMONIALS.map((item) => (
            <StaggerItem key={item.name}>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col justify-between h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-colors duration-150 hover:border-zinc-300"
              >
                <div>
                  <span
                    aria-hidden="true"
                    className="font-serif text-4xl text-zinc-300 leading-none block mb-2 select-none"
                  >
                    “
                  </span>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {item.quote}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 font-semibold text-xs border border-zinc-200">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.role} · {item.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
