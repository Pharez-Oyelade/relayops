"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Target,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  User,
  Building,
  Mail,
  DollarSign,
  ArrowRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type LeadStage = "NEW" | "CONTACTED" | "PROPOSAL_SENT" | "CONVERTED";

interface LeadMessage {
  sender: "CLIENT" | "AGENCY";
  content: string;
  sentAt: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  company?: string;
  projectType?: string;
  budgetRange?: string;
  stage: LeadStage;
  messages: LeadMessage[];
  createdAt: string;
}

const STAGES: { id: LeadStage; label: string; dotColor: string; pillColor: string }[] = [
  { id: "NEW", label: "New Inquiries", dotColor: "bg-purple-500", pillColor: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { id: "CONTACTED", label: "Contacted", dotColor: "bg-sky-500", pillColor: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent", dotColor: "bg-amber-500", pillColor: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { id: "CONVERTED", label: "Converted", dotColor: "bg-emerald-500", pillColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const { activeWorkspace, activeTenantId } = useTenantStore();

  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Lead Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newBudget, setNewBudget] = useState("$5,000 - $10,000");
  const [newNotes, setNewNotes] = useState("");

  // Fetch Leads
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["leads", activeTenantId],
    queryFn: async () => {
      const res = await api.get("/leads");
      return res.data?.data || [];
    },
    enabled: !!activeTenantId,
  });

  // Mutate Lead Stage
  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: LeadStage }) => {
      const res = await api.patch(`/leads/${leadId}`, { stage });
      return res.data?.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["leads", activeTenantId] });
      if (selectedLead && selectedLead._id === updated._id) {
        setSelectedLead(updated);
      }
      toast.success("Lead stage updated");
    },
  });

  // Convert Lead to Client (ACID Transaction)
  const convertMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await api.post(`/leads/${leadId}/convert`);
      return res.data?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads", activeTenantId] });
      queryClient.invalidateQueries({ queryKey: ["projects", activeTenantId] });
      queryClient.invalidateQueries({ queryKey: ["clients", activeTenantId] });
      setSelectedLead(null);
      toast.success(
        `Successfully converted lead! Client project ${data?.project?.key || ""} created.`,
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to convert lead.");
    },
  });

  // Create Manual Lead
  const createLeadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/leads/public/${activeWorkspace?.slug || "workspace"}`, {
        name: newName,
        email: newEmail,
        company: newCompany,
        budgetRange: newBudget,
        message: newNotes || "Direct prospect inquiry",
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", activeTenantId] });
      setIsAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewCompany("");
      setNewNotes("");
      toast.success("Prospect added to pipeline");
    },
  });

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && activeWorkspace?.slug) {
      const url = `${window.location.origin}/inquire/${activeWorkspace.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info("Public inquiry link copied to clipboard");
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
      l.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sales CRM Pipeline
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture prospective clients, qualify inbound deals, and trigger 1-click conversion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            title="Copy public inquiry intake link"
          >
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500 stroke-[2]" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
            )}
            <span>{copied ? "Copied Link" : "Intake Form Link"}</span>
          </Button>

          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
            Add Prospect
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospects by name, company, or email..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* 4-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {STAGES.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.stage === col.id);

          return (
            <div
              key={col.id}
              className="rounded-xl border border-border bg-card p-4 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-semibold text-foreground">
                    {col.label}
                  </span>
                </div>
                <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 py-3 overflow-y-auto">
                {colLeads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => setSelectedLead(lead)}
                    className="group rounded-lg border border-border/70 bg-background/60 p-3.5 transition-all hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-2xs cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {lead.name}
                      </span>
                      {lead.budgetRange && (
                        <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                          {lead.budgetRange}
                        </span>
                      )}
                    </div>

                    {lead.company && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                        <Building className="h-3 w-3 stroke-[1.5]" />
                        {lead.company}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                      <span className="flex items-center gap-1 font-mono">
                        <MessageSquare className="h-3 w-3 stroke-[1.5]" />
                        {lead.messages?.length || 1} msg
                      </span>
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="h-32 flex items-center justify-center border border-dashed border-border/60 rounded-lg text-[11px] text-muted-foreground">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Lead Detail & 1-Click Convert Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md border-l border-border bg-card p-6 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Prospect Details
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {selectedLead.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {/* Stage Switcher */}
              <div>
                <label className="text-[11px] font-semibold uppercase text-muted-foreground block mb-1.5">
                  Pipeline Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        updateStageMutation.mutate({
                          leadId: selectedLead._id,
                          stage: s.id,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
                        selectedLead.stage === s.id
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Meta */}
              <div className="rounded-lg border border-border bg-background/50 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-foreground">{selectedLead.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="text-foreground font-medium">
                    {selectedLead.company || "Independent"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-mono text-emerald-600 font-semibold">
                    {selectedLead.budgetRange || "Negotiable"}
                  </span>
                </div>
              </div>

              {/* Message History Thread */}
              <div>
                <label className="text-[11px] font-semibold uppercase text-muted-foreground block mb-2">
                  Inquiry Message History
                </label>
                <div className="space-y-2.5">
                  {selectedLead.messages?.map((msg, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wider text-primary">
                          {msg.sender}
                        </span>
                        <span>{formatDate(msg.sentAt)}</span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer: 1-Click Convert to Client */}
            <div className="pt-4 border-t border-border space-y-2">
              <Button
                variant="emerald"
                size="lg"
                onClick={() => convertMutation.mutate(selectedLead._id)}
                disabled={convertMutation.isPending}
                isLoading={convertMutation.isPending}
                className="w-full"
              >
                <Sparkles className="mr-1.5 h-4 w-4 stroke-[1.5]" />
                <span>Convert to Active Client</span>
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Atomically creates client login, initial project, and dispatches invite email
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                Add Prospective Lead
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsAddModalOpen(false)}
                disabled={createLeadMutation.isPending}
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Contact Name
                </label>
                <Input
                  type="text"
                  required
                  disabled={createLeadMutation.isPending}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  disabled={createLeadMutation.isPending}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Company / Brand
                </label>
                <Input
                  type="text"
                  disabled={createLeadMutation.isPending}
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Acme Innovations"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Estimated Budget
                </label>
                <Select
                  value={newBudget}
                  disabled={createLeadMutation.isPending}
                  onChange={(e) => setNewBudget(e.target.value)}
                >
                  <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000+">$25,000+</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Initial Notes / Requirements
                </label>
                <Textarea
                  rows={3}
                  disabled={createLeadMutation.isPending}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Client reached out via referral regarding rebranding..."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={createLeadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createLeadMutation.mutate()}
                disabled={!newName || !newEmail || createLeadMutation.isPending}
                isLoading={createLeadMutation.isPending}
              >
                Add to Pipeline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
