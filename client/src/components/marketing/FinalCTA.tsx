"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

export default function FinalCTA() {
  return (
    <section className="w-full bg-zinc-950 py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Headline with baton underline */}
        <MotionWrapper variant="fadeUp">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.18]">
            Ready to never drop the{" "}
            <span className="relative inline-block text-primary whitespace-nowrap rotate-[4deg] transition-transform duration-200 ease-out hover:-translate-y-1">
              baton
              <svg
                className="absolute -bottom-2.5 sm:-bottom-3.5 -left-[4%] w-[108%] h-3 sm:h-4 text-primary overflow-visible pointer-events-none"
                viewBox="0 0 160 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12C32 4 68 14 105 7C125 3 142 8 157 5"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            ?
          </h2>
        </MotionWrapper>

        {/* Subtitle */}
        <MotionWrapper variant="fadeUp" delay={0.1}>
          <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed font-normal">
            Launch your workspace in 60 seconds. Free to start, no credit card
            required.
          </p>
        </MotionWrapper>

        {/* CTAs */}
        <MotionWrapper variant="fadeUp" delay={0.15}>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.98] shadow-xs group"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 stroke-2 group-hover:ml-3 transition-all duration-150" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-6 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all duration-150 active:scale-[0.98]"
            >
              Client Portal Login
            </Link>
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
