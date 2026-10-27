"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  ExternalLink,
  FolderKanban,
  CreditCard,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Member {
  _id: string;
  userId?: {
    _id: string;
    email: string;
    name?: string;
  };
  role: string;
  status: "INVITED" | "ACTIVE" | "DEACTIVATED";
  clientCompany?: string;
  createdAt: string;
}

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const { activeTenantId, activeWorkspace } = useTenantStore();

  const [search, setSearch] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Member | null>(null);

  // Invite Client Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCompany, setInviteCompany] = useState("");

  // Fetch Memberships & Filter Client Viewers
  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["members", activeTenantId],
    queryFn: async () => {
      const res = await api.get("/tenants/members");
      return res.data?.data || [];
    },
    enabled: !!activeTenantId,
  });

  const clients = members.filter((m) => m.role === "CLIENT_VIEWER");

  // Invite Client Mutation
  const inviteClientMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/tenants/invite", {
        email: inviteEmail,
        role: "CLIENT_VIEWER",
        clientCompany: inviteCompany,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", activeTenantId] });
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteCompany("");
      toast.success("Client invitation dispatched via Resend!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to invite client.");
    },
  });

  const filteredClients = clients.filter((c) => {
    const comp = c.clientCompany?.toLowerCase() || "";
    const email = c.userId?.email?.toLowerCase() || "";
    const name = c.userId?.name?.toLowerCase() || "";
    const query = search.toLowerCase();
    return comp.includes(query) || email.includes(query) || name.includes(query);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clients Directory & Accounts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage active client organizations, invited user logins, and cross-project deliverables
          </p>
        </div>

        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
          Invite Client Account
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
            placeholder="Search by company, contact name, or email..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-4">Company / Organization</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">Portal Status</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredClients.map((client) => {
                const company = client.clientCompany || client.userId?.name || "Client Account";
                const email = client.userId?.email || "—";
                const isInvited = client.status === "INVITED";

                return (
                  <tr
                    key={client._id}
                    onClick={() => setSelectedClient(client)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                          <Building2 className="h-4 w-4 stroke-[1.5]" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {company}
                          </span>
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            CLIENT_VIEWER
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{client.userId?.name || "—"}</span>
                      <span className="block text-[11px] font-mono text-muted-foreground">
                        {email}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                          isInvited
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}
                      >
                        {isInvited ? (
                          <>
                            <Clock className="h-2.5 w-2.5 stroke-[2]" />
                            Invite Pending
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-2.5 w-2.5 stroke-[2]" />
                            Active Member
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(client.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-xs text-primary font-medium group-hover:underline">
                        View 360° Profile →
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground/50 stroke-[1.5] mb-2" />
                    <p className="text-xs font-semibold text-foreground">No client accounts yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Convert leads from the Sales CRM or click &quot;Invite Client Account&quot; to add commercial partners.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client 360° Profile Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md border-l border-border bg-card p-6 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Client 360° Profile
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {selectedClient.clientCompany || "Client Organization"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Email:</span>
                  <span className="font-mono text-foreground font-medium">
                    {selectedClient.userId?.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Name:</span>
                  <span className="text-foreground">{selectedClient.userId?.name || "Pending Signup"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Portal Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedClient.status}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Client Navigation
                </span>
                <Link
                  href="/dashboard/projects"
                  onClick={() => setSelectedClient(null)}
                  className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary stroke-[1.5]" />
                    <span>View Assigned Projects</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] text-muted-foreground" />
                </Link>

                <Link
                  href="/dashboard/invoices"
                  onClick={() => setSelectedClient(null)}
                  className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-500 stroke-[1.5]" />
                    <span>View Client Invoices</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] text-muted-foreground" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={() => setSelectedClient(null)}
                className="w-full rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Client Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                Invite Client Account
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsInviteModalOpen(false)}
                disabled={inviteClientMutation.isPending}
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Client Company / Brand Name
                </label>
                <Input
                  type="text"
                  required
                  disabled={inviteClientMutation.isPending}
                  value={inviteCompany}
                  onChange={(e) => setInviteCompany(e.target.value)}
                  placeholder="Starlight Media Group"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Client Contact Email
                </label>
                <Input
                  type="email"
                  required
                  disabled={inviteClientMutation.isPending}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="billing@starlightmedia.com"
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                An onboarding email will be dispatched via Resend SDK inviting this client to their dedicated portal (`CLIENT_VIEWER`).
              </p>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsInviteModalOpen(false)}
                disabled={inviteClientMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => inviteClientMutation.mutate()}
                disabled={!inviteEmail || inviteClientMutation.isPending}
                isLoading={inviteClientMutation.isPending}
              >
                Send Client Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
