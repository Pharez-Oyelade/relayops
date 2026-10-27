"use client";

import { X, CheckCircle, AlertCircle, MessageSquare, CreditCard, Clock } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ActivityNotification {
  id: string;
  type: "comment" | "approval" | "revision" | "payment";
  title: string;
  description: string;
  timestamp: string;
  projectKey: string;
  read: boolean;
}

const mockActivities: ActivityNotification[] = [
  {
    id: "act-1",
    type: "approval",
    title: "Deliverable Approved",
    description: "Client signed off on DEL-0002: Landing Page Wireframe.",
    timestamp: "12m ago",
    projectKey: "PRJ-01",
    read: false,
  },
  {
    id: "act-2",
    type: "comment",
    title: "New Client Revision Feedback",
    description: "Acme Corp requested: 'Please update button corner radius to 8px.'",
    timestamp: "1h ago",
    projectKey: "PRJ-01",
    read: false,
  },
  {
    id: "act-3",
    type: "payment",
    title: "Invoice Paid via Paystack",
    description: "Invoice #REL-0001 (USD $2,500.00) confirmed successfully.",
    timestamp: "3h ago",
    projectKey: "PRJ-01",
    read: true,
  },
];

export function ActivityDrawer() {
  const { activityDrawerOpen, setActivityDrawerOpen } = useUIStore();

  if (!activityDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md border-l border-border bg-card p-6 shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Activity & Notifications
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deliverable sign-offs, revision feedback & billing updates
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setActivityDrawerOpen(false)}
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </Button>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {mockActivities.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border p-3.5 transition-colors cursor-pointer",
                item.read
                  ? "border-border/60 bg-background/50 hover:bg-muted/40"
                  : "border-primary/30 bg-primary/5 hover:bg-primary/10",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.type === "approval" && (
                    <CheckCircle className="h-4 w-4 text-emerald-500 stroke-[1.5]" />
                  )}
                  {item.type === "revision" && (
                    <AlertCircle className="h-4 w-4 text-amber-500 stroke-[1.5]" />
                  )}
                  {item.type === "comment" && (
                    <MessageSquare className="h-4 w-4 text-sky-500 stroke-[1.5]" />
                  )}
                  {item.type === "payment" && (
                    <CreditCard className="h-4 w-4 text-indigo-500 stroke-[1.5]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {item.projectKey}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>3 total updates</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => setActivityDrawerOpen(false)}
            className="p-0 h-auto text-xs"
          >
            Mark all as read
          </Button>
        </div>
      </div>
    </div>
  );
}
