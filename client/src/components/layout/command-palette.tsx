"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FolderKanban,
  CheckSquare,
  CreditCard,
  Users,
  LayoutDashboard,
  ShieldCheck,
  Search,
  MessageSquare,
  Target,
  UserCheck,
  LogOut,
} from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useTenantStore } from "@/stores/tenant.store";
import { useAuthStore } from "@/stores/auth.store";
import { logout } from "@/lib/auth";

export function CommandPalette() {
  const router = useRouter();
  const { cmdKOpen, setCmdKOpen } = useUIStore();
  const { workspaces, setActiveTenantId } = useTenantStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdKOpen(!cmdKOpen);
      }
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleSidebar();
      }
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleActivityDrawer();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [cmdKOpen, setCmdKOpen]);

  if (!cmdKOpen) return null;

  const navigateTo = (path: string) => {
    setCmdKOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground stroke-[1.5]" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
              <Command.Item
                onSelect={() => navigateTo("/dashboard")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4 stroke-[1.5] text-indigo-500" />
                <span>Executive Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/projects")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <FolderKanban className="h-4 w-4 stroke-[1.5] text-primary" />
                <span>Projects Portfolio</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/deliverables")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <CheckSquare className="h-4 w-4 stroke-[1.5] text-indigo-500" />
                <span>Deliverables & Tasks</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/invoices")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <CreditCard className="h-4 w-4 stroke-[1.5] text-emerald-500" />
                <span>Invoices & Billing</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/clients")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <Users className="h-4 w-4 stroke-[1.5] text-sky-500" />
                <span>Clients Directory</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/leads")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <Target className="h-4 w-4 stroke-[1.5] text-amber-500" />
                <span>Sales Leads CRM</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/communications")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <MessageSquare className="h-4 w-4 stroke-[1.5] text-violet-500" />
                <span>Communications Hub</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/settings/team")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <UserCheck className="h-4 w-4 stroke-[1.5] text-zinc-400" />
                <span>Team & Quotas</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard/audit")}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
              >
                <ShieldCheck className="h-4 w-4 stroke-[1.5] text-zinc-400" />
                <span>Audit Logs</span>
              </Command.Item>
            </Command.Group>

            {workspaces.length > 1 && (
              <Command.Group heading="Workspaces" className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
                {workspaces.map((w) => (
                  <Command.Item
                    key={w.tenantId}
                    onSelect={() => {
                      setActiveTenantId(w.tenantId);
                      setCmdKOpen(false);
                    }}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/60 aria-selected:bg-muted"
                  >
                    <span>{w.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {w.role}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Account" className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
              <Command.Item
                onSelect={() => {
                  setCmdKOpen(false);
                  logout();
                }}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-rose-500/10 aria-selected:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4 stroke-[1.5]" />
                <span>Sign Out {user?.email ? `(${user.email})` : ""}</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[10px] text-muted-foreground font-mono bg-muted/20">
            <span>Use ↑↓ to navigate, ↵ to select, esc to close</span>
            <span>RelayOps v1.0</span>
          </div>
        </Command>
      </div>

      <div
        className="fixed inset-0 -z-10"
        onClick={() => setCmdKOpen(false)}
      />
    </div>
  );
}
