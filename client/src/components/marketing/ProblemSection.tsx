"use client";

import { motion } from "motion/react";
import {
  AlertTriangle,
  MessageSquareX,
  FileX2,
  GitPullRequestDraft,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export default function ProblemSection() {
  return (
    <section className="w-full bg-[#f8f9fa] py-20 sm:py-24 px-6 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <MotionWrapper variant="fadeUp">
          <Eyebrow
            icon={
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 stroke-[1.5]" />
            }
            className="mb-6 bg-white border-zinc-200 text-zinc-900"
          >
            The Core Agency Friction
          </Eyebrow>
        </MotionWrapper>

        {/* Centered Headline */}
        <MotionWrapper variant="fadeUp" delay={0.06}>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-4xl mx-auto leading-[1.18] text-center">
            Most agencies don&apos;t have a delivery problem, they have a{" "}
            <span className="relative inline-block text-primary whitespace-nowrap rotate-[5deg] transition-transform duration-200 ease-out hover:-translate-y-1">
              handoff
              <svg
                className="absolute -bottom-2 sm:-bottom-3 -left-[4%] w-[108%] h-2.5 sm:h-3.5 text-primary overflow-visible pointer-events-none"
                viewBox="0 0 160 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 11C35 5 72 13 108 7C126 4 142 8 157 6"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{" "}
            problem
          </h2>
        </MotionWrapper>

        {/* Subheadline */}
        <MotionWrapper variant="fadeUp" delay={0.12}>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center font-normal">
            When project tracking, client approval, and invoicing live in five
            different tabs, momentum dies in the transactions.
          </p>
        </MotionWrapper>

        {/* Problem Cards */}
        <StaggerChildren
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full"
          staggerDelay={0.1}
        >
          {/* Card 1: Approvals */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-300 transition-all duration-150 rotate-2 hover:rotate-0"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Drop 01 // Invisible Scope Creep
                  </span>
                  <MessageSquareX className="h-4 w-4 text-zinc-400 stroke-[1.5]" />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  &ldquo;Quick Tweaks&rdquo; Never Make it to the Invoice
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                  Without locked milestones, feedback in DMs quietly turns into
                  multiple revision rounds with zero formal sign-off.
                </p>
              </div>

              {/* UI Fragment */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-700">
                  <span className="font-sans font-medium text-zinc-900">
                    Deliverable v3.2_FINAL
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-100/80 px-1.5 py-0.5 rounded">
                    Sign-off Missing
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200 pt-2">
                  <span>Revisions: Round 6 of 2</span>
                  <span className="text-rose-600 font-semibold">
                    +18 hrs unbilled
                  </span>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Card 2: Project Tracking */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-300 transition-colors duration-150"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Drop 02 // Project Sync
                  </span>
                  <GitPullRequestDraft className="h-4 w-4 text-zinc-400 stroke-[1.5]" />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Linear for Devs, Stale Sheets for Clients
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                  Engineers work in tickets while clients stare at spreadsheets
                  that went stale days ago, leading to endless status calls.
                </p>
              </div>

              {/* UI Fragment */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-700">
                  <span className="font-sans font-medium text-zinc-900">
                    Sprint Board (Dev)
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    ✓ Shipped
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200 pt-2">
                  <span className="font-sans font-medium text-zinc-900">
                    Client Sheet
                  </span>
                  <span className="text-amber-600 font-semibold bg-amber-100/80 px-1.5 py-0.5 rounded">
                    Stale (14 days ago)
                  </span>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Card 3: Invoicing */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-300 transition-colors duration-150 -rotate-2 hover:rotate-0"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Drop 03 // Invoicing
                  </span>
                  <FileX2 className="h-4 w-4 text-zinc-400 stroke-[1.5]" />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Delivery Finishes, Invoices Sit in Other Tabs
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                  Work is completed on time, but because PM and accounting
                  don&apos;t connect, billing lags by weeks and cash flow
                  stalls.
                </p>
              </div>

              {/* UI Fragment */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-700">
                  <span className="font-sans font-medium text-zinc-900">
                    Milestone Deliverable
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    ✓ Approved (21d ago)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200 pt-2">
                  <span className="font-sans font-medium text-zinc-900">
                    Milestone Invoice
                  </span>
                  <span className="text-rose-600 font-semibold bg-rose-100/80 px-1.5 py-0.5 rounded">
                    Unsent / Draft Lag
                  </span>
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
