import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: ThemeMode;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      theme: "light",

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarMobileOpen: (open) =>
        set({ sidebarMobileOpen: open }),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ems-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }),
    }
  )
);
