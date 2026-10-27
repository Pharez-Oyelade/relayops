import { create } from "zustand";

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "CLIENT_VIEWER";

export interface WorkspaceSummary {
  tenantId: string;
  name: string;
  slug: string;
  role: Role;
  plan: string;
  settings?: {
    currency?: string;
    invoicePrefix?: string;
  };
}

interface TenantState {
  activeTenantId: string | null;
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
  setActiveTenantId: (tenantId: string) => void;
  setWorkspaces: (workspaces: WorkspaceSummary[], preferredTenantId?: string) => void;
  clearTenants: () => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  activeTenantId: null,
  workspaces: [],
  activeWorkspace: null,
  setActiveTenantId: (tenantId: string) => {
    const workspace = get().workspaces.find((w) => w.tenantId === tenantId) || null;
    if (typeof window !== "undefined") {
      localStorage.setItem("relayops_active_tenant", tenantId);
    }
    set({
      activeTenantId: tenantId,
      activeWorkspace: workspace,
    });
  },
  setWorkspaces: (workspaces: WorkspaceSummary[], preferredTenantId?: string) => {
    let chosenId = preferredTenantId;
    if (!chosenId && typeof window !== "undefined") {
      chosenId = localStorage.getItem("relayops_active_tenant") || undefined;
    }
    if (!chosenId || !workspaces.some((w) => w.tenantId === chosenId)) {
      chosenId = workspaces[0]?.tenantId || undefined;
    }

    const activeWorkspace = workspaces.find((w) => w.tenantId === chosenId) || null;
    if (chosenId && typeof window !== "undefined") {
      localStorage.setItem("relayops_active_tenant", chosenId);
    }

    set({
      workspaces,
      activeTenantId: chosenId || null,
      activeWorkspace,
    });
  },
  clearTenants: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("relayops_active_tenant");
    }
    set({
      activeTenantId: null,
      workspaces: [],
      activeWorkspace: null,
    });
  },
}));
