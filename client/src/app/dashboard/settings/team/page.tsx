"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  Plus,
  Mail,
  Shield,
  ShieldAlert,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  Crown,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore, Role } from "@/stores/tenant.store";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Member {
  _id: string;
  userId?: {
    _id: string;
    email: string;
    name?: string;
  };
  role: Role;
  status: "INVITED" | "ACTIVE" | "DEACTIVATED";
  createdAt: string;
}

export default function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const { activeTenantId, activeWorkspace } = useTenantStore();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("MEMBER");

  // Fetch Members
  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["members", activeTenantId],
    queryFn: async () => {
      const res = await api.get("/tenants/members");
      return res.data?.data || [];
    },
    enabled: !!activeTenantId,
  });

  // Filter team members (excluding CLIENT_VIEWER who live in Clients Hub)
  const teamMembers = members.filter((m) => m.role !== "CLIENT_VIEWER");
  const maxSeats = activeWorkspace?.plan === "FREE" ? 5 : 25;

  // Invite Team Member Mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/tenants/invite", {
        email: inviteEmail,
        role: inviteRole,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", activeTenantId] });
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
      toast.success("Team invitation sent via Resend!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to invite team member.");
    },
  });

  // Update Member Role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ membershipId, role }: { membershipId: string; role: Role }) => {
      const res = await api.patch(`/tenants/members/${membershipId}/role`, { role });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", activeTenantId] });
      toast.success("Member role updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Cannot change role.");
    },
  });

  const roleStyles: Record<Role, string> = {
    OWNER: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    ADMIN: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    MEMBER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    CLIENT_VIEWER: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team Members & Seat Quotas
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage agency permissions, roles (`OWNER`, `ADMIN`, `MEMBER`), and seat limits
          </p>
        </div>

        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
          Invite Team Member
        </Button>
      </div>

      {/* Plan Seat Quota Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {activeWorkspace?.plan || "FREE"} Plan Quota
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {teamMembers.length} of {maxSeats} active seats used
            </span>
          </div>
          <span className="font-mono text-xs text-primary font-bold">
            {Math.round((teamMembers.length / maxSeats) * 100)}%
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(teamMembers.length / maxSeats) * 100}%` }}
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {teamMembers.map((member) => (
                <tr key={member._id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground border border-border">
                        {member.userId?.name?.charAt(0) || member.userId?.email?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-foreground">
                        {member.userId?.name || "Pending Onboarding"}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {member.userId?.email || "—"}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium ${
                        roleStyles[member.role]
                      }`}
                    >
                      {member.role === "OWNER" && <Crown className="mr-1 h-3 w-3 stroke-[2]" />}
                      {member.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                        member.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {formatDate(member.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {member.role !== "OWNER" ? (
                      <Select
                        value={member.role}
                        disabled={updateRoleMutation.isPending}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            membershipId: member._id,
                            role: e.target.value as Role,
                          })
                        }
                        className="h-8 py-1 text-[11px] w-auto"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MEMBER">MEMBER</option>
                      </Select>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Workspace Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                Invite Team Member
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsInviteModalOpen(false)}
                disabled={inviteMemberMutation.isPending}
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  disabled={inviteMemberMutation.isPending}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@agency.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Assigned Workspace Role
                </label>
                <Select
                  value={inviteRole}
                  disabled={inviteMemberMutation.isPending}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                >
                  <option value="MEMBER">MEMBER (Delivery Staff, Designer, Dev)</option>
                  <option value="ADMIN">ADMIN (Team Manager, Client Lead)</option>
                </Select>
              </div>

              <p className="text-[11px] text-muted-foreground">
                A 24-hour invitation link will be dispatched via Resend SDK allowing them to set up their account.
              </p>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsInviteModalOpen(false)}
                disabled={inviteMemberMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => inviteMemberMutation.mutate()}
                disabled={!inviteEmail || inviteMemberMutation.isPending}
                isLoading={inviteMemberMutation.isPending}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
