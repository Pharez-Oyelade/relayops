"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Bell,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Send,
  Building2,
  FolderKanban,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

interface FeedItem {
  id: string;
  author: string;
  role: string;
  projectKey: string;
  projectName: string;
  type: "comment" | "approval" | "revision" | "payment";
  content: string;
  timestamp: string;
  linkHref: string;
}

const initialFeed: FeedItem[] = [
  {
    id: "f-1",
    author: "Sarah Jenkins",
    role: "Client",
    projectKey: "PRJ-01",
    projectName: "Mobile App v2",
    type: "revision",
    content: "Requested adjustments on DEL-0004: 'Could we increase contrast on the navigation header?'",
    timestamp: "25 minutes ago",
    linkHref: "/dashboard/projects",
  },
  {
    id: "f-2",
    author: "Alex Morgan",
    role: "Agency Lead",
    projectKey: "PRJ-01",
    projectName: "Mobile App v2",
    type: "comment",
    content: "Uploaded revised Cloudinary prototype assets for DEL-0004. Ready for review.",
    timestamp: "1 hour ago",
    linkHref: "/dashboard/projects",
  },
  {
    id: "f-3",
    author: "System Engine",
    role: "Paystack Gateway",
    projectKey: "PRJ-01",
    projectName: "Mobile App v2",
    type: "payment",
    content: "Invoice #REL-0001 (₦450,000.00) successfully paid and verified via webhook.",
    timestamp: "3 hours ago",
    linkHref: "/dashboard/invoices",
  },
  {
    id: "f-4",
    author: "David Chen",
    role: "Client",
    projectKey: "CLT-002",
    projectName: "Brand Guidelines",
    type: "approval",
    content: "Signed off on DEL-0002: Typography & Color Scale. Billable milestone invoice triggered.",
    timestamp: "Yesterday",
    linkHref: "/dashboard/projects",
  },
];

export default function CommunicationsPage() {
  const { toggleActivityDrawer } = useUIStore();
  const { user } = useAuthStore();
  const { activeWorkspace } = useTenantStore();

  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [newNote, setNewNote] = useState("");
  const [targetProject, setTargetProject] = useState("PRJ-01");

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newItem: FeedItem = {
      id: `f-${Date.now()}`,
      author: user?.name || "You",
      role: activeWorkspace?.role?.replace("_", " ") || "Member",
      projectKey: targetProject,
      projectName: "Active Engagement",
      type: "comment",
      content: newNote,
      timestamp: "Just now",
      linkHref: "/dashboard/projects",
    };

    setFeed([newItem, ...feed]);
    setNewNote("");
    toast.success("Project update broadcasted to team & client members");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Communications Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Contextual deliverable feedback, revision notes, and cross-project client activity
          </p>
        </div>

        <button
          onClick={toggleActivityDrawer}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors active:scale-[0.98]"
        >
          <Bell className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
          <span>Toggle Activity Drawer (Cmd+M)</span>
        </button>
      </div>

      {/* Main Grid: Post announcement + Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Discussion Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post Form */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pb-2 border-b border-border/60">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary stroke-[1.5]" />
                Post Project Update or Notice
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Target:</span>
                <Select
                  value={targetProject}
                  onChange={(e) => setTargetProject(e.target.value)}
                  className="h-7 py-0 text-xs font-mono font-medium w-auto"
                >
                  <option value="PRJ-01">PRJ-01 (Mobile App v2)</option>
                  <option value="CLT-002">CLT-002 (Brand Guidelines)</option>
                </Select>
              </div>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-2.5">
              <Textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Broadcast a milestone update, meeting recap, or deliverable announcement to client viewers..."
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newNote.trim()}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Broadcast Note</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Activity Stream */}
          <div className="space-y-3">
            {feed.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-2.5 transition-colors hover:border-zinc-400 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground border border-border">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {item.author}
                        </span>
                        <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                          {item.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold text-primary px-2 py-0.5 rounded border border-primary/20 bg-primary/10">
                    {item.projectKey}
                  </span>
                </div>

                <p className="text-xs text-foreground leading-relaxed pl-9">
                  {item.content}
                </p>

                <div className="flex justify-end pt-2 border-t border-border/50 text-xs">
                  <Link
                    href={item.linkHref}
                    className="text-primary font-medium hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>View Context</span>
                    <ArrowRight className="h-3 w-3 stroke-[2]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Contextual Channels */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Project Discussion Channels
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/projects"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background/50 hover:bg-muted/40 transition-colors text-xs font-medium text-foreground"
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary stroke-[1.5]" />
                  <span>PRJ-01: Mobile App v2</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">2 active</span>
              </Link>

              <Link
                href="/dashboard/projects"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background/50 hover:bg-muted/40 transition-colors text-xs font-medium text-foreground"
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-emerald-500 stroke-[1.5]" />
                  <span>CLT-002: Brand Guidelines</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">1 active</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
