"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { setWorkspaces } = useTenantStore();

  const [email, setEmail] = useState("owner@relayops.io");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, accessToken, workspaces } = res.data.data;

      setAuth(user, accessToken);

      // Hydrate user workspaces directly from login payload or fallback to /tenants/me
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
          "Failed to log in. Please check your credentials.",
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
            Sign In to RelayOps
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your credentials to access your agency or client portal
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                <Input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5] pointer-events-none" />
                <Input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full h-10"
            >
              <span>Sign In</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 stroke-[1.5]" />
            </Button>
          </form>

          {/* Seed Account Quick Helper */}
          <div className="mt-4 pt-4 border-t border-border/60 text-center">
            <span className="text-[11px] text-muted-foreground">
              Demo Seed: <span className="font-mono text-foreground">owner@relayops.io</span> / <span className="font-mono text-foreground">Password123!</span>
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-muted-foreground">
          Don&apos;t have an agency workspace?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an agency
          </Link>
        </div>
      </div>
    </div>
  );
}
