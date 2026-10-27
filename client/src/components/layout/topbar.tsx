"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  ChevronRight,
  Moon,
  Search,
  Sun,
  LogOut,
  Loader2,
} from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useTenantStore } from "@/stores/tenant.store";
import { useAuthStore } from "@/stores/auth.store";
import { logout } from "@/lib/auth";

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { toggleCmdK, toggleActivityDrawer } = useUIStore();
  const { activeWorkspace } = useTenantStore();
  const { user } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/60 backdrop-blur-md px-4">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <span className="text-foreground font-semibold">
          {activeWorkspace?.name || "RelayOps"}
        </span>
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 stroke-[1.5] text-muted-foreground/60" />
            <span
              className={
                idx === segments.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground cursor-pointer"
              }
            >
              {seg}
            </span>
          </div>
        ))}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Global Search / Cmd+K Button */}
        <button
          onClick={toggleCmdK}
          className="flex h-8 items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 text-xs text-muted-foreground hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline">Search or jump to...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Activity & Comment Notifications Drawer Toggle */}
        <button
          onClick={toggleActivityDrawer}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 active:scale-[0.98] cursor-pointer"
          title="Activity & Notifications (Cmd+M)"
        >
          <Bell className="h-4 w-4 stroke-[1.5]" />
          {/* Active notification indicator dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Theme Toggle (Light / Dark / System) */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 active:scale-[0.98] cursor-pointer"
          title="Toggle Theme"
        >
          <Sun className="h-4 w-4 stroke-[1.5] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 stroke-[1.5] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Quick Sign Out */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          title={`Sign out (${user?.email || "Account"})`}
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.5]" />
          ) : (
            <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
          )}
        </button>
      </div>
    </header>
  );
}
