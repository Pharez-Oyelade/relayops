"use client";

import { motion } from "motion/react";
import { Play } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/ui/stagger-children";

const stats = [
  { metric: "5×", label: "Faster approvals" },
  { metric: "Zero", label: "Dropped handoffs" },
  { metric: "< 2 min", label: "Lead to invoice" },
] as const;

export default function ProductShowcase() {
  return (
    <section className="w-full bg-zinc-950 py-20 sm:py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <MotionWrapper variant="fadeUp" className="flex flex-col items-center">
          <Eyebrow
            icon={
              <Play className="h-3.5 w-3.5 text-zinc-100 stroke-[1.5]" />
            }
            className="mb-6 bg-zinc-800 border-zinc-700 text-zinc-100"
          >
            See It In Action
          </Eyebrow>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white text-center">
            Watch the relay in motion
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl text-center">
            From lead capture to client checkout in under two minutes
          </p>
        </MotionWrapper>

        {/* Video container */}
        <MotionWrapper
          variant="scaleIn"
          delay={0.15}
          duration={0.6}
          className="mt-12 sm:mt-16 w-full max-w-4xl"
        >
          <div className="relative aspect-video w-full rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-150 cursor-pointer"
              aria-label="Play demo video"
            >
              <Play className="h-6 w-6 text-white stroke-[1.5] ml-0.5" />
            </motion.button>

            <span className="mt-4 text-sm text-zinc-500">
              Demo video coming soon
            </span>
          </div>
        </MotionWrapper>

        {/* Stats row */}
        <StaggerChildren className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full max-w-2xl text-center">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.metric}</p>
              <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
