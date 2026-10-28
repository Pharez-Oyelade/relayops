"use client";

import {
  Zap,
  UserPlus,
  FolderOpen,
  Layers,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const STEPS = [
  {
    id: 1,
    title: "Lead Capture",
    description: "Inquiries land in your pipeline, not your inbox",
    icon: UserPlus,
  },
  {
    id: 2,
    title: "Project Kickoff",
    description: "Scope, milestones, and team set up in minutes",
    icon: FolderOpen,
  },
  {
    id: 3,
    title: "Deliverable Workflow",
    description: "Track every task from draft to done",
    icon: Layers,
  },
  {
    id: 4,
    title: "Client Approval",
    description: "One-click sign-off, no more email chains",
    icon: CheckCircle,
  },
  {
    id: 5,
    title: "Invoice & Payment",
    description: "Auto-generate invoices the moment work is approved",
    icon: CreditCard,
  },
] as const;

export default function LifecycleSection() {
  return (
    <section className="w-full bg-background py-20 sm:py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <MotionWrapper variant="fadeUp" delay={0}>
          <Eyebrow
            icon={<Zap className="h-3.5 w-3.5 text-foreground stroke-[1.5]" />}
            className="mb-6"
          >
            The Complete Relay
          </Eyebrow>
        </MotionWrapper>

        {/* Headline */}
        <MotionWrapper variant="fadeUp" delay={0.05}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 max-w-4xl mx-auto leading-[1.18] text-center">
            From first contact to final invoice, one unbroken handoff
          </h2>
        </MotionWrapper>

        {/* Subheadline */}
        <MotionWrapper variant="fadeUp" delay={0.1}>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-center font-normal">
            RelayOps connects every stage of client work so nothing falls
            through the cracks.
          </p>
        </MotionWrapper>

        {/* Timeline flow */}
        <StaggerChildren className="mt-14 sm:mt-20 w-full" staggerDelay={0.1}>
          {/* Desktop: horizontal flow */}
          <div className="hidden md:block">
            <div className="relative grid grid-cols-5 gap-0">
              {/* Connecting line — horizontal, sits behind the nodes */}
              <div
                aria-hidden="true"
                className="absolute top-5 left-[10%] right-[10%] h-px bg-primary/30 z-0"
              />

              {STEPS.map((step) => (
                <StaggerItem
                  key={step.id}
                  className="relative z-10 flex flex-col items-center text-center px-2"
                >
                  {/* Node circle with solid white surface so the line is completely occluded */}
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-white shadow-xs">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                      <step.icon className="h-3.5 w-3.5 text-primary stroke-[1.5]" />
                    </div>
                  </div>

                  {/* Step number */}
                  <span className="mt-4 font-mono text-xs font-semibold text-primary/70 tracking-wider">
                    {String(step.id).padStart(2, "0")}
                  </span>

                  {/* Title */}
                  <h3 className="mt-1.5 text-sm font-bold text-zinc-900 leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed max-w-[180px]">
                    {step.description}
                  </p>
                </StaggerItem>
              ))}
            </div>
          </div>

          {/* Mobile: vertical flow */}
          <div className="md:hidden">
            <div className="relative flex flex-col gap-0">
              {STEPS.map((step, idx) => (
                <StaggerItem key={step.id} className="relative flex gap-5">
                  {/* Left rail: node + vertical connector */}
                  <div className="flex flex-col items-center">
                    {/* Node circle with solid white surface so the vertical line is occluded */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-white shadow-xs">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                        <step.icon className="h-3.5 w-3.5 text-primary stroke-[1.5]" />
                      </div>
                    </div>

                    {/* Vertical connector (hidden on last item) */}
                    {idx < STEPS.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="w-px grow bg-primary/25 my-0"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-10 pt-1.5">
                    <span className="font-mono text-xs font-semibold text-primary/70 tracking-wider">
                      {String(step.id).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-zinc-900 leading-snug">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed max-w-xs">
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </StaggerChildren>
      </div>
    </section>
  );
}
