"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Building, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { setWorkspaces } = useTenantStore();

  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWorkspaceName(value);
    if (!isSlugEdited) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setWorkspaceSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const derivedSlug = (workspaceSlug || workspaceName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const finalSlug = derivedSlug.length >= 3 ? derivedSlug : `${derivedSlug || "workspace"}-agency`;

    try {
      const res = await api.post("/auth/register", {
        name,
        workspaceName,
        workspaceSlug: finalSlug,
        email,
        password,
      });

      const { user, accessToken, workspaces } = res.data.data;
      setAuth(user, accessToken);

      // Hydrate workspaces in store
      if (workspaces && workspaces.length > 0) {
        setWorkspaces(workspaces);
      } else {
        const tenantsRes = await api.get("/tenants/me");
        if (tenantsRes.data?.data) {
          setWorkspaces(tenantsRes.data.data);
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Failed to create workspace. Please check your inputs.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm tracking-tight border border-border shadow-xs">
              RO
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              RelayOps
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Agency Workspace
          </h1>
          <p className="text-xs text-muted-foreground">
            Set up your organization, invite team members, and deliver to clients
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0 stroke-[1.5]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                <Input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Agency / Workspace Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                <Input
                  type="text"
                  required
                  disabled={loading}
                  value={workspaceName}
                  onChange={handleWorkspaceNameChange}
                  placeholder="Acme Studio"
                  className="pl-9"
                />
              </div>
              {workspaceSlug && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <span>relayops.io/inquire/</span>
                  <input
                    type="text"
                    disabled={loading}
                    value={workspaceSlug}
                    onChange={(e) => {
                      setIsSlugEdited(true);
                      setWorkspaceSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      );
                    }}
                    className="border-b border-border/80 bg-transparent text-foreground focus:outline-none focus:border-primary px-0.5 text-[11px] font-mono"
                    placeholder="acme-studio"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                <Input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acmestudio.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                <Input
                  type="password"
                  required
                  minLength={8}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="mt-2 w-full h-10"
            >
              <span>Create Workspace</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 stroke-[1.5]" />
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
