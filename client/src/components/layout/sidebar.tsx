"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Target,
  UserCheck,
  Users,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore, Role } from "@/stores/tenant.store";
import { useUIStore } from "@/stores/ui.store";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["OWNER", "ADMIN", "MEMBER", "CLIENT_VIEWER"],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Projects",
        href: "/dashboard/projects",
        icon: FolderKanban,
        roles: ["OWNER", "ADMIN", "MEMBER", "CLIENT_VIEWER"],
      },
      {
        label: "Deliverables",
        href: "/dashboard/deliverables",
        icon: CheckSquare,
        roles: ["OWNER", "ADMIN", "MEMBER", "CLIENT_VIEWER"],
      },
      {
        label: "Invoices",
        href: "/dashboard/invoices",
        icon: CreditCard,
        roles: ["OWNER", "ADMIN", "MEMBER", "CLIENT_VIEWER"],
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        label: "Clients",
        href: "/dashboard/clients",
        icon: Users,
        roles: ["OWNER", "ADMIN", "MEMBER"],
      },
      {
        label: "Leads",
        href: "/dashboard/leads",
        icon: Target,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Communications",
        href: "/dashboard/communications",
        icon: MessageSquare,
        roles: ["OWNER", "ADMIN", "MEMBER", "CLIENT_VIEWER"],
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        label: "Team & Quotas",
        href: "/dashboard/settings/team",
        icon: UserCheck,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Audit Logs",
        href: "/dashboard/audit",
        icon: ShieldCheck,
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { activeWorkspace, workspaces, setActiveTenantId } = useTenantStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const currentRole = activeWorkspace?.role || "MEMBER";
  const isClientViewer = currentRole === "CLIENT_VIEWER";

  const roleLabel = isClientViewer
    ? "Client Portal"
    : currentRole === "OWNER"
      ? "Owner Portal"
      : currentRole === "ADMIN"
        ? "Admin Portal"
        : "Member Portal";

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "RO";

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-200 ease-in-out select-none",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Workspace Brand / Portal Header (Inspired by NXT Agency Admin Portal) */}
      <div className="flex h-16 items-center justify-between border-b border-border px-3.5">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm tracking-tight border border-border shadow-xs">
              {activeWorkspace?.name?.charAt(0) || "R"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold tracking-tight text-foreground truncate">
                {activeWorkspace?.name || "RelayOps Agency"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {roleLabel}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 active:scale-[0.98] cursor-pointer",
            sidebarCollapsed && "mx-auto",
          )}
          title={sidebarCollapsed ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 stroke-[1.5]" />
          ) : (
            <PanelLeftClose className="h-4 w-4 stroke-[1.5]" />
          )}
        </button>
      </div>

      {/* Workspace Switcher dropdown (when multiple exist) */}
      {!sidebarCollapsed && workspaces.length > 1 && (
        <div className="p-2 border-b border-border">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2">
            Switch Workspace
          </label>
          <select
            value={activeWorkspace?.tenantId || ""}
            onChange={(e) => setActiveTenantId(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {workspaces.map((w) => (
              <option key={w.tenantId} value={w.tenantId}>
                {w.name} ({w.role})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Categorized Navigation Groups */}
      <nav className="flex-1 space-y-4 p-3 overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(currentRole),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1">
                  {group.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors duration-150 active:scale-[0.98]",
                      isActive
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      sidebarCollapsed && "justify-center px-0",
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Footer (Matching NXT User Pill with Initials and Sign Out) */}
      <div className="border-t border-border p-3">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs text-foreground border border-border"
              title={`${user?.name || "User"} (${user?.email || ""})`}
            >
              {userInitials}
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              title="Sign out"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" />
              ) : (
                <LogOut className="h-4 w-4 stroke-[1.5]" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs text-foreground border border-border">
                {userInitials}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user?.name || "Admin User"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {user?.email || "admin@relayops.io"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-150 active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              title="Sign out"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.5]" />
              ) : (
                <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
