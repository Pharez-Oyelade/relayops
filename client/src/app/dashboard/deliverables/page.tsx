"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  FolderKanban,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DeliverableItem {
  _id: string;
  code: string;
  title: string;
  projectId: {
    _id: string;
    name: string;
    key: string;
    clientName: string;
  };
  status: "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  priority: string;
  isBillableMilestone: boolean;
  milestoneAmount: number;
  assets?: Array<any>;
  createdAt: string;
}

export default function AllDeliverablesPage() {
  const { activeTenantId, activeWorkspace } = useTenantStore();
  const isClient = activeWorkspace?.role === "CLIENT_VIEWER";
  const currency = activeWorkspace?.settings?.currency || "USD";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: deliverables = [], isLoading } = useQuery<DeliverableItem[]>({
    queryKey: ["all-deliverables", activeTenantId, statusFilter],
    queryFn: async () => {
      const url = statusFilter
        ? `/deliverables?status=${statusFilter}`
        : "/deliverables";
      const res = await api.get(url);
      return res.data?.data || [];
    },
    enabled: !!activeTenantId,
  });

  const statusStyles: Record<string, string> = {
    BACKLOG: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    IN_PROGRESS: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    IN_REVIEW: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    CHANGES_REQUESTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };

  const filtered = deliverables.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.projectId?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isClient ? "Deliverables for Review & Sign-Off" : "Deliverables Across Projects"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isClient
              ? "All active deliverable mockups, Cloudinary assets, and milestones awaiting approval"
              : "Global view of active deliverable cards, review statuses, and milestone invoices"}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deliverables by code, title, or project..."
            className="pl-9 bg-card"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-auto bg-card"
        >
          <option value="">All Statuses</option>
          <option value="BACKLOG">Backlog</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review (Awaiting Client)</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
          <option value="APPROVED">Approved & Signed Off</option>
        </Select>
      </div>

      {/* Deliverables List Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Deliverable Title</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Milestone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-muted/40 transition-colors group">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-primary">
                      {item.code}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-mono">
                      {item.assets?.length || 0} Cloudinary files
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-foreground font-medium">
                      {item.projectId?.name || "Project"}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-mono">
                      {item.projectId?.key}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {item.isBillableMilestone ? (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.milestoneAmount, currency)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium ${
                        statusStyles[item.status] || statusStyles.BACKLOG
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={item.projectId?._id ? `/dashboard/projects/${item.projectId._id}` : "/dashboard/projects"}
                      className="text-xs text-primary font-medium group-hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Kanban Board</span>
                      <ArrowRight className="h-3 w-3 stroke-[2]" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <CheckSquare className="mx-auto h-8 w-8 text-muted-foreground/50 stroke-[1.5] mb-2" />
                    <p className="text-xs font-semibold text-foreground">No deliverables found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Open a project to create deliverable cards and review assets.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
