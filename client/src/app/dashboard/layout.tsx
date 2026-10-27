"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { api } from "@/lib/api";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const { setWorkspaces } = useTenantStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      // If already authenticated in memory, fetch workspaces and proceed
      if (isAuthenticated) {
        try {
          const res = await api.get("/tenants/me");
          if (res.data?.data) {
            setWorkspaces(res.data.data);
          }
        } catch {
          // Keep current state
        } finally {
          setIsInitializing(false);
        }
        return;
      }

      // Attempt silent token refresh via httpOnly cookie
      try {
        const refreshRes = await api.post("/auth/refresh");
        const token = refreshRes.data?.data?.accessToken;
        const user = refreshRes.data?.data?.user;
        const workspaces = refreshRes.data?.data?.workspaces;

        if (token && user) {
          setAuth(user, token);
          if (workspaces && workspaces.length > 0) {
            setWorkspaces(workspaces);
          } else {
            const tenantsRes = await api.get("/tenants/me");
            if (tenantsRes.data?.data) {
              setWorkspaces(tenantsRes.data.data);
            }
          }
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [isAuthenticated, router, setAuth, setWorkspaces]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground font-mono">
            Securing RelayOps workspace...
          </span>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
