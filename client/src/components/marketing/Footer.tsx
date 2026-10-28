"use client";

import Link from "next/link";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

export default function Footer() {
  return (
    <footer className="bg-black/90 text-white pt-16 md:pt-20 pb-6 px-6 md:px-10 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-16 border-b border-zinc-800/80">
          {/* Brand statement */}
          <div className="md:col-span-2 space-y-3">
            <h2 className="font-semibold text-base text-zinc-100">RelayOps OS</h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              The operating system for seamless project handoffs. From lead and
              client onboarding to deliverable sign-off and instant checkout, all
              in one workspace.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-zinc-200 uppercase tracking-wider">Product</h3>
            <div className="flex flex-col space-y-2 text-sm text-zinc-400">
              <Link href="#features" className="hover:text-primary transition-colors duration-150">
                Features
              </Link>
              <Link href="#workflow" className="hover:text-primary transition-colors duration-150">
                Relay Workflow
              </Link>
              <Link href="#pricing" className="hover:text-primary transition-colors duration-150">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-primary transition-colors duration-150">
                Client Portal
              </Link>
            </div>
          </div>

          {/* Legal & More */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-zinc-200 uppercase tracking-wider">Company</h3>
            <div className="flex flex-col space-y-2 text-sm text-zinc-400">
              <Link href="/privacy" className="hover:text-primary transition-colors duration-150">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors duration-150">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors duration-150">
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Big Wordmark */}
        <MotionWrapper variant="fadeIn" delay={0.1} duration={0.8}>
          <div className="text-4xl sm:text-7xl lg:text-9xl font-extrabold text-center py-10 tracking-tighter text-primary/90 select-none">
            RELAYOPS
          </div>
        </MotionWrapper>

        {/* Copyright */}
        <div className="pt-4 text-center text-xs text-zinc-500 font-medium">
          &copy; 2026 RelayOps OS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
