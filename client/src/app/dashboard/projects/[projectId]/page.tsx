"use client";

import { use, useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderKanban,
  CheckSquare,
  Plus,
  ArrowLeft,
  Upload,
  FileText,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  CreditCard,
  Building2,
  DollarSign,
  MessageSquare,
  Send,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

interface DeliverableAsset {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  uploadedAt: string;
}

interface Deliverable {
  _id: string;
  code: string;
  title: string;
  description?: string;
  status: "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  orderIndex: number;
  isBillableMilestone: boolean;
  milestoneAmount: number;
  assets: DeliverableAsset[];
  approvalMetadata?: {
    decidedAt: string;
    clientFeedback?: string;
  };
  createdAt: string;
}

interface ProjectDetail {
  _id: string;
  name: string;
  key: string;
  clientName: string;
  status: string;
  totalBudget?: number;
}

const COLUMNS = [
  { id: "BACKLOG", label: "Backlog", dot: "bg-zinc-400" },
  { id: "IN_PROGRESS", label: "In Progress", dot: "bg-blue-500" },
  { id: "IN_REVIEW", label: "In Review", dot: "bg-amber-500" },
  { id: "CHANGES_REQUESTED", label: "Changes Requested", dot: "bg-rose-500" },
  { id: "APPROVED", label: "Approved & Sign-Off", dot: "bg-emerald-500" },
];

export default function ProjectBoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeTenantId, activeWorkspace } = useTenantStore();
  const { user } = useAuthStore();
  const isClient = activeWorkspace?.role === "CLIENT_VIEWER";
  const currency = activeWorkspace?.settings?.currency || "USD";

  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [isNewDeliverableOpen, setIsNewDeliverableOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [uploadingAsset, setUploadingAsset] = useState(false);

  // New Deliverable Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isBillable, setIsBillable] = useState(false);
  const [milestoneAmount, setMilestoneAmount] = useState("");

  // Fetch Project Metadata
  const { data: project } = useQuery<ProjectDetail>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data?.data;
    },
  });

  // Fetch Deliverables
  const { data: deliverables = [], isLoading } = useQuery<Deliverable[]>({
    queryKey: ["deliverables", projectId],
    queryFn: async () => {
      const res = await api.get(`/deliverables?projectId=${projectId}`);
      return res.data?.data || [];
    },
  });

  // Create Deliverable Mutation
  const createDeliverableMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title,
        description,
        priority,
        isBillableMilestone: isBillable,
      };
      if (isBillable && milestoneAmount) {
        payload.milestoneAmount = Math.round(parseFloat(milestoneAmount) * 100);
      }
      const res = await api.post(`/deliverables?projectId=${projectId}`, payload);
      return res.data?.data;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ["deliverables", projectId] });
      setIsNewDeliverableOpen(false);
      setTitle("");
      setDescription("");
      setIsBillable(false);
      setMilestoneAmount("");
      toast.success(`Deliverable ${item.code} created`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create deliverable");
    },
  });

  // Move Deliverable Mutation (Kanban Drag-and-Drop)
  const moveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/deliverables/${id}/move`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables", projectId] });
      toast.success("Deliverable moved");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Cannot move to Approved without formal sign-off.");
    },
  });

  // Submit Sign-Off Review Decision (Approve vs Changes Requested)
  const decisionMutation = useMutation({
    mutationFn: async ({
      id,
      decision,
      feedback,
    }: {
      id: string;
      decision: "APPROVE" | "REQUEST_CHANGES";
      feedback?: string;
    }) => {
      const res = await api.post(`/deliverables/${id}/decision`, {
        decision,
        feedback,
      });
      return res.data?.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deliverables", projectId] });
      queryClient.invalidateQueries({ queryKey: ["invoices", activeTenantId] });
      setSelectedDeliverable(null);
      setFeedbackText("");
      if (variables.decision === "APPROVE") {
        toast.success("Deliverable signed off! Milestone invoice generated.");
      } else {
        toast.info("Change request logged and team notified.");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit decision.");
    },
  });

  // Upload Asset directly to Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDeliverable) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingAsset(true);
    try {
      const res = await api.post(
        `/deliverables/${selectedDeliverable._id}/assets`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const updated = res.data?.data;
      setSelectedDeliverable(updated);
      queryClient.invalidateQueries({ queryKey: ["deliverables", projectId] });
      toast.success("File uploaded to Cloudinary CDN successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingAsset(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Breadcrumb / Navigation Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
            <span>Back to Projects</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {project?.name || "Project Deliverables"}
            </h1>
            <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded border border-primary/20 bg-primary/10">
              {project?.key || "PRJ"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Client: <span className="text-foreground font-semibold">{project?.clientName}</span>
          </p>
        </div>

        {!isClient && (
          <Button onClick={() => setIsNewDeliverableOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
            Add Deliverable
          </Button>
        )}
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start">
        {COLUMNS.map((col) => {
          const colItems = deliverables.filter((d) => d.status === col.id);

          return (
            <div
              key={col.id}
              className="rounded-xl border border-border bg-card p-3.5 flex flex-col min-h-[550px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold text-foreground">
                    {col.label}
                  </span>
                </div>
                <span className="inline-flex items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                  {colItems.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-2.5 py-3 overflow-y-auto">
                {colItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedDeliverable(item)}
                    className="group rounded-lg border border-border/80 bg-background/60 p-3.5 transition-all hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-2xs cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-primary">{item.code}</span>
                      <span className="text-muted-foreground uppercase">{item.priority}</span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground mt-1.5 group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>

                    {item.isBillableMilestone && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        <DollarSign className="h-3 w-3 stroke-[2]" />
                        <span>{formatCurrency(item.milestoneAmount, currency)}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                      <span>{item.assets?.length || 0} files</span>
                      <span className="text-primary font-medium group-hover:underline">Review →</span>
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <div className="h-28 flex items-center justify-center border border-dashed border-border/60 rounded-lg text-[10px] text-muted-foreground">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliverable Inspection & Sign-Off Drawer */}
      {selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl border-l border-border bg-card p-6 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="font-mono text-xs font-bold text-primary">
                  {selectedDeliverable.code}
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {selectedDeliverable.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Current State:</span>
                  <span className="ml-2 font-semibold text-foreground">
                    {selectedDeliverable.status.replace("_", " ")}
                  </span>
                </div>
                {selectedDeliverable.isBillableMilestone && (
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Milestone: {formatCurrency(selectedDeliverable.milestoneAmount, currency)}
                  </span>
                )}
              </div>

              {selectedDeliverable.description && (
                <div>
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground block mb-1">
                    Requirements & Brief
                  </label>
                  <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/60">
                    {selectedDeliverable.description}
                  </p>
                </div>
              )}

              {/* Cloudinary Asset Pipeline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Cloudinary CDN Attachments ({selectedDeliverable.assets?.length || 0})
                  </label>
                  {!isClient && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAsset}
                      isLoading={uploadingAsset}
                    >
                      <Upload className="h-3.5 w-3.5 stroke-[1.5]" />
                      <span>{uploadingAsset ? "Uploading..." : "Upload File"}</span>
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="space-y-2">
                  {selectedDeliverable.assets?.map((asset, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="h-4 w-4 text-primary stroke-[1.5] shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-xs">
                          {asset.fileName}
                        </span>
                      </div>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline shrink-0"
                      >
                        <span>Preview CDN</span>
                        <ExternalLink className="h-3 w-3 stroke-[1.5]" />
                      </a>
                    </div>
                  ))}

                  {selectedDeliverable.assets?.length === 0 && (
                    <div className="p-6 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground">
                      No assets uploaded yet
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback History (if changes were requested) */}
              {selectedDeliverable.approvalMetadata?.clientFeedback && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400 space-y-1">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Client Revision Feedback:
                  </span>
                  <p>{selectedDeliverable.approvalMetadata.clientFeedback}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer: Formal Review Decision Controls */}
            <div className="pt-4 border-t border-border space-y-3">
              {selectedDeliverable.status !== "APPROVED" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground block">
                      Client Review Notes / Feedback
                    </label>
                    <Textarea
                      rows={2}
                      disabled={decisionMutation.isPending}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Specify requested changes, or leave approval notes..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="destructive"
                      onClick={() =>
                        decisionMutation.mutate({
                          id: selectedDeliverable._id,
                          decision: "REQUEST_CHANGES",
                          feedback: feedbackText || "Please revise mockup layout.",
                        })
                      }
                      disabled={decisionMutation.isPending}
                      isLoading={decisionMutation.isPending && decisionMutation.variables?.decision === "REQUEST_CHANGES"}
                    >
                      Request Changes
                    </Button>

                    <Button
                      variant="emerald"
                      onClick={() =>
                        decisionMutation.mutate({
                          id: selectedDeliverable._id,
                          decision: "APPROVE",
                          feedback: feedbackText,
                        })
                      }
                      disabled={decisionMutation.isPending}
                      isLoading={decisionMutation.isPending && decisionMutation.variables?.decision === "APPROVE"}
                    >
                      <CheckCircle2 className="h-4 w-4 stroke-[2]" />
                      <span>Approve Milestone</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 stroke-[2]" />
                  <span>Deliverable Signed Off & Invoiced</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Deliverable Modal */}
      {isNewDeliverableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                Add Project Deliverable
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsNewDeliverableOpen(false)}
                disabled={createDeliverableMutation.isPending}
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Deliverable Title
                </label>
                <Input
                  type="text"
                  required
                  disabled={createDeliverableMutation.isPending}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Hero Section Interactive Prototype"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Priority
                </label>
                <Select
                  value={priority}
                  disabled={createDeliverableMutation.isPending}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="billableCheck"
                  disabled={createDeliverableMutation.isPending}
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label htmlFor="billableCheck" className="text-xs font-medium text-foreground cursor-pointer">
                  Is Billable Milestone? (Triggers auto-invoice upon sign-off)
                </label>
              </div>

              {isBillable && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Milestone Amount ({currency})
                  </label>
                  <Input
                    type="number"
                    required
                    disabled={createDeliverableMutation.isPending}
                    value={milestoneAmount}
                    onChange={(e) => setMilestoneAmount(e.target.value)}
                    placeholder="2500"
                    className="font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Description & Scope
                </label>
                <Textarea
                  rows={3}
                  disabled={createDeliverableMutation.isPending}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Asset specifications, format requirements, and acceptance criteria..."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNewDeliverableOpen(false)}
                disabled={createDeliverableMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createDeliverableMutation.mutate()}
                disabled={!title || createDeliverableMutation.isPending}
                isLoading={createDeliverableMutation.isPending}
              >
                Create Deliverable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
