import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  activityDrawerOpen: boolean;
  cmdKOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleActivityDrawer: () => void;
  setActivityDrawerOpen: (open: boolean) => void;
  toggleCmdK: () => void;
  setCmdKOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activityDrawerOpen: false,
  cmdKOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleActivityDrawer: () =>
    set((state) => ({ activityDrawerOpen: !state.activityDrawerOpen })),
  setActivityDrawerOpen: (open) => set({ activityDrawerOpen: open }),
  toggleCmdK: () => set((state) => ({ cmdKOpen: !state.cmdKOpen })),
  setCmdKOpen: (open) => set({ cmdKOpen: open }),
}));
