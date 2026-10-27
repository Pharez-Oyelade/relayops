import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Hero({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-20 text-center">
      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/90 px-3.5 py-2 text-xs font-medium text-foreground mb-6">
        <Sparkles className="h-3.5 w-3.5 text-black stroke-[1.5]" />
        <span>Modern Agency operations and Client Delivery OS</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.18]">
        Never Drop the{" "}
        <span className="relative inline-block text-primary whitespace-nowrap">
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
        Between Delivery and Billing
      </h1>

      {/* Subtitle */}
      <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
        One workspace for your team.
        <br className="hidden sm:inline" /> A dedicated portal for every client
        and zero dropped handoffs
      </p>

      {/* Hero CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href={isAuthenticated ? "/dashboard" : "/register"}
          className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.98] shadow-xs group"
        >
          Launch Agency Workspace
          <ArrowRight className="ml-2 h-4 w-4 stroke-2 group-hover:ml-3 transition-all duration-150" />
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted transition-all duration-150 active:scale-[0.98]"
        >
          Client Portal Login
        </Link>
      </div>

      {/* <div className="mt-14 w-full max-w-4xl border-y border-border/60 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80 mb-3">
            Powering fast-moving product teams, design studios & delivery
            consultancies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 stroke-[1.5]" /> Starlight Media
            </span>
            <span className="flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5 stroke-[1.5]" /> HyperScale
              Ops
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 stroke-[1.5]" /> Apex Capital
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" /> Creative Pulse
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 stroke-[1.5]" /> Vendra Studio
            </span>
          </div>
        </div> */}

      {/* Dashboard Preview Image */}
      <div className="w-full max-w-7xl">
        <Image
          src="/23shots_so.png"
          width={1000}
          height={1000}
          alt="Dashboard Preview"
          className="object-cover w-full"
        />
      </div>
    </main>
  );
}
