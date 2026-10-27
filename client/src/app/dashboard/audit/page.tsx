"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Sparkles,
  FileCheck2,
  CreditCard,
  FolderKanban,
  UserCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  _id: string;
  actorId: {
    _id: string;
    email?: string;
    name?: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { activeTenantId } = useTenantStore();
  const [filterType, setFilterType] = useState<string>("");

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["audit-logs", activeTenantId, filterType],
    queryFn: async () => {
      const url = filterType
        ? `/audit-logs?entityType=${filterType}`
        : "/audit-logs";
      const res = await api.get(url);
      return res.data?.data || [];
    },
    enabled: !!activeTenantId,
  });

  const getActionBadge = (action: string) => {
    if (action.includes("CONVERTED") || action.includes("APPROVED") || action.includes("PAID")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    if (action.includes("INVITED") || action.includes("SENT")) {
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    }
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Audit Trail & Compliance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log of all workspace events, lead conversions, sign-offs, and Paystack transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-auto bg-card"
          >
            <option value="">All Entities</option>
            <option value="LEAD">Leads</option>
            <option value="PROJECT">Projects</option>
            <option value="DELIVERABLE">Deliverables</option>
            <option value="INVOICE">Invoices</option>
            <option value="TENANT">Workspace</option>
          </Select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold ${getActionBadge(
                        log.action,
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    <span className="text-foreground font-semibold">{log.entityType}</span> #
                    {log.entityId?.slice(-6)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-foreground">
                      {log.actorId?.email || "System Actor"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                    {log.metadata ? JSON.stringify(log.metadata).slice(0, 50) + "..." : "—"}
                  </td>

                  <td className="py-3.5 px-4 text-right text-muted-foreground font-mono">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50 stroke-[1.5] mb-2" />
                    <p className="text-xs font-semibold text-foreground">No audit entries recorded yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      All state changes and transactions will appear here in chronological order.
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
