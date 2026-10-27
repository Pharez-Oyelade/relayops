"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  clientName: string;
  clientUserIds: string[];
  status: "PROPOSED" | "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
  totalBudget?: number;
  dueDate?: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { activeTenantId, activeWorkspace } = useTenantStore();
  const isClient = activeWorkspace?.role === "CLIENT_VIEWER";
  const currency = activeWorkspace?.settings?.currency || "USD";

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [clientName, setClientName] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [description, setDescription] = useState("");

  // Fetch Projects (Backend applies row-level client scoping automatically)
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects", activeTenantId],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data?.data || [];
    },
    enabled: !!activeTenantId,
  });

  // Create / Propose Project Mutation
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isClient ? "/projects/propose" : "/projects";
      const payload: any = {
        name,
        description,
      };

      if (!isClient) {
        payload.key = key.toUpperCase();
        payload.clientName = clientName;
        if (totalBudget) {
          payload.totalBudget = Math.round(parseFloat(totalBudget) * 100); // convert to minor units
        }
      }

      const res = await api.post(endpoint, payload);
      return res.data?.data;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects", activeTenantId] });
      setIsModalOpen(false);
      setName("");
      setKey("");
      setClientName("");
      setTotalBudget("");
      setDescription("");
      toast.success(
        isClient
          ? "Project proposal submitted for agency review!"
          : `Project ${project.key} created successfully!`,
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create project.");
    },
  });

  const statusBadges: Record<Project["status"], { label: string; color: string }> = {
    PROPOSED: { label: "PROPOSED", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    PLANNING: { label: "PLANNING", color: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
    ACTIVE: { label: "ACTIVE", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    ON_HOLD: { label: "ON HOLD", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    COMPLETED: { label: "COMPLETED", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    ARCHIVED: { label: "ARCHIVED", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isClient ? "My Assigned Projects" : "Project Portfolio"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isClient
              ? "All engagements, milestones, and deliverables assigned to your company"
              : "Active workspace delivery portfolio, scoped keys, and client deliverables"}
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
          {isClient ? "Propose New Project" : "New Project"}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by key, title, or client..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const badge = statusBadges[project.status] || statusBadges.PLANNING;

          return (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="group rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-xs active:scale-[0.99] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary tracking-wide">
                    {project.key}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium font-mono",
                      badge.color,
                    )}
                  >
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </h3>

                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 stroke-[1.5] shrink-0" />
                  <span className="truncate">{project.clientName}</span>
                </p>

                {project.description && (
                  <p className="text-xs text-muted-foreground/80 mt-2.5 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-xs">
                <div>
                  {project.totalBudget ? (
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(project.totalBudget, currency)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Milestone billing</span>
                  )}
                </div>

                <span className="text-[11px] font-medium text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Board <ArrowRight className="h-3 w-3 stroke-[2]" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredProjects.length === 0 && !isLoading && (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
          <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50 stroke-[1.5] mb-2" />
          <h3 className="text-sm font-semibold text-foreground">No projects found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {isClient
              ? "You haven't been assigned to any projects yet or your proposal is pending."
              : "Create your first project or convert a lead from the Sales CRM."}
          </p>
        </div>
      )}

      {/* New Project / Propose Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                {isClient ? "Propose New Project" : "Create New Project"}
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsModalOpen(false)}
                disabled={createProjectMutation.isPending}
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Project Title
                </label>
                <Input
                  type="text"
                  required
                  disabled={createProjectMutation.isPending}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!isClient && !key) {
                      setKey(
                        e.target.value
                          .replace(/[^a-zA-Z]/g, "")
                          .slice(0, 3)
                          .toUpperCase(),
                      );
                    }
                  }}
                  placeholder="Mobile App v2 Redesign"
                />
              </div>

              {!isClient && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Project Key (Prefix)
                    </label>
                    <Input
                      type="text"
                      required
                      maxLength={6}
                      disabled={createProjectMutation.isPending}
                      value={key}
                      onChange={(e) => setKey(e.target.value.toUpperCase())}
                      placeholder="PRJ"
                      className="font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Client Organization
                    </label>
                    <Input
                      type="text"
                      required
                      disabled={createProjectMutation.isPending}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
              )}

              {!isClient && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Total Project Budget ({currency})
                  </label>
                  <Input
                    type="number"
                    disabled={createProjectMutation.isPending}
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="15000"
                    className="font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Scope & Deliverable Overview
                </label>
                <Textarea
                  rows={3}
                  disabled={createProjectMutation.isPending}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key milestones, expected deliverables, and timeline constraints..."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={createProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createProjectMutation.mutate()}
                disabled={!name || createProjectMutation.isPending}
                isLoading={createProjectMutation.isPending}
              >
                {isClient ? "Submit Proposal" : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
