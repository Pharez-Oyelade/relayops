"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import Hero from "@/components/marketing/Hero";

export default function PublicLandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      {/* Public Navigation Header (annotated: 'login / client portal' on top right) */}
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

      {/* Hero Section */}
      <Hero isAuthenticated={isAuthenticated} />

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground">
        <span>© 2026 RelayOps OS. All rights reserved.</span>
      </footer>
    </div>
  );
}
