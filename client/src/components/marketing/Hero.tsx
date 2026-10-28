"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

export default function Hero({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
      {/* Category Pill */}
      <MotionWrapper variant="fadeUp" delay={0}>
        <Eyebrow
          icon={
            <Sparkles className="h-3.5 w-3.5 text-foreground stroke-[1.5]" />
          }
          className="mb-6"
        >
          Modern Agency Operations and Client Delivery OS
        </Eyebrow>
      </MotionWrapper>

      {/* Main Headline */}
      <MotionWrapper variant="fadeUp" delay={0.08}>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.18]">
          Never Drop the{" "}
          <span className="relative inline-block text-primary whitespace-nowrap rotate-[5deg] transition-transform duration-200 ease-out hover:-translate-y-1">
            Baton
            <svg
              className="absolute -bottom-2.5 sm:-bottom-3.5 -left-[4%] w-[108%] h-3 sm:h-4.5 text-primary overflow-visible pointer-events-none"
              viewBox="0 0 160 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12C32 4 68 14 105 7C125 3 142 8 157 5"
                stroke="currentColor"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>{" "}
          From Inbound Lead to Delivery
        </h1>
      </MotionWrapper>

      {/* Subtitle */}
      <MotionWrapper variant="fadeUp" delay={0.16}>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          One workspace for your team.
          <br className="hidden sm:inline" /> A dedicated portal for every
          client and zero dropped handoffs
        </p>
      </MotionWrapper>

      {/* Hero CTAs */}
      <MotionWrapper variant="fadeUp" delay={0.24}>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.98] shadow-xs group"
          >
            Launch Workspace
            <ArrowRight className="ml-2 h-4 w-4 stroke-2 group-hover:ml-3 transition-all duration-150" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted transition-all duration-150 active:scale-[0.98]"
          >
            Client Portal Login
          </Link>
        </div>
      </MotionWrapper>

      {/* Dashboard Preview Image */}
      <MotionWrapper
        variant="scaleIn"
        delay={0.32}
        duration={0.6}
        className="w-full max-w-6xl mt-6 sm:mt-10"
      >
        <Image
          src="/23shots_so.png"
          width={1200}
          height={800}
          alt="Dashboard Preview"
          className="object-cover w-full"
          priority
        />
      </MotionWrapper>
    </section>
  );
}
