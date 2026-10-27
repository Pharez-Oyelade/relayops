"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ActivityDrawer } from "@/components/layout/activity-drawer";
import { CommandPalette } from "@/components/layout/command-palette";
import { Toaster } from "sonner";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Contextual Activity & Revision Feedback Drawer */}
      <ActivityDrawer />

      {/* Global Cmd+K Command Search Dialog */}
      <CommandPalette />

      {/* Toast Notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
