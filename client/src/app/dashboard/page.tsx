"use client";

import Link from "next/link";
import {
  Calendar,
  AlertCircle,
  FolderKanban,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { formatCurrency } from "@/lib/utils";

interface PipelinePhase {
  name: string;
  count: number;
  percentage: number;
  barColor: string;
}

const pipelinePhases: PipelinePhase[] = [
  { name: "Proposed", count: 0, percentage: 0, barColor: "bg-zinc-400" },
  { name: "Discovery", count: 1, percentage: 17, barColor: "bg-purple-500" },
  { name: "Design", count: 1, percentage: 17, barColor: "bg-pink-500" },
  { name: "Development", count: 3, percentage: 50, barColor: "bg-blue-500" },
  { name: "Review", count: 1, percentage: 17, barColor: "bg-amber-500" },
  { name: "Delivered", count: 0, percentage: 0, barColor: "bg-emerald-500" },
];

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const { activeWorkspace } = useTenantStore();

  const userName = user?.name?.split(" ")[0] || "Pharez";
  const currency = activeWorkspace?.settings?.currency || "NGN";

  const currentDateFormatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Greeting & Date Header (Inspired by NXT Dashboard) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {userName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your agency today.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-2xs w-fit">
          <Calendar className="h-3.5 w-3.5 stroke-[1.5]" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid (NXT Layout Aesthetic) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Revenue */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Revenue
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-3.5 w-3.5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {formatCurrency(45000000, currency)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">All Time</span>
            <span className="inline-flex items-center gap-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-2.5 w-2.5 stroke-[2]" />
              +12% from last period
            </span>
          </div>
        </div>

        {/* Metric 2: Outstanding Balance */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Outstanding Balance
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500">
              <AlertCircle className="h-3.5 w-3.5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {formatCurrency(0, currency)}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground">
              0 unpaid invoices
            </span>
          </div>
        </div>

        {/* Metric 3: Active Projects */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Active Projects
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-500">
              <FolderKanban className="h-3.5 w-3.5 stroke-[1.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-sans tracking-tight text-foreground">
              6
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground">
              In progress
            </span>
          </div>
        </div>

        {/* Metric 4: New Leads */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              New Leads
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-500">
              <Users className="h-3.5 w-3.5 stroke-[1.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-sans tracking-tight text-foreground">
              1
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground">
              Awaiting contact
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Project Pipeline + Priority Tasks (Inspired by NXT Agency Split) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Project Pipeline */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Project Pipeline
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribution of active projects by phase
              </p>
            </div>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3 stroke-[1.5]" />
            </Link>
          </div>

          {/* Pipeline Phases List */}
          <div className="mt-4 space-y-4">
            {pipelinePhases.map((phase) => (
              <div key={phase.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{phase.name}</span>
                  <span className="font-mono text-foreground font-semibold">
                    {phase.count}
                  </span>
                </div>
                {/* Clean Flat Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  {phase.count > 0 && (
                    <div
                      className={`h-full rounded-full ${phase.barColor}`}
                      style={{ width: `${Math.max(phase.percentage, 12)}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Priority Tasks */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Priority Tasks
              </h2>
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                1 Pending
              </span>
            </div>

            {/* Task Card (Exact NXT style) */}
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border bg-background/50 p-4 transition-colors hover:border-zinc-400 dark:hover:border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                    <Clock className="h-3.5 w-3.5 stroke-[1.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-foreground truncate">
                      Brand Architecture & Deliverable Sign-Off
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Vendra — Client Project
                    </p>
                    <div className="mt-2.5">
                      <span className="text-[10px] font-bold text-rose-500 uppercase font-mono tracking-wider">
                        OVERDUE: SEP 7
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Task Card */}
              <div className="rounded-lg border border-border bg-background/50 p-4 transition-colors hover:border-zinc-400 dark:hover:border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Clock className="h-3.5 w-3.5 stroke-[1.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-foreground truncate">
                      Mobile App Wireframe Review (DEL-0004)
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Acme Mobile Redesign
                    </p>
                    <div className="mt-2.5">
                      <span className="text-[10px] font-bold text-amber-500 uppercase font-mono tracking-wider">
                        DUE TODAY: 5:00 PM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link
              href="/dashboard/deliverables"
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all duration-150 active:scale-[0.98]"
            >
              <span>View All Tasks & Deliverables</span>
              <ArrowRight className="h-3 w-3 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
