import { create } from "zustand";

interface GlobalState {
  sideMenuCollapsed: boolean;
  setSideMenuCollapsed: (val: boolean) => void;
}
export const useGlobalStore = create<GlobalState>((set) => ({
  sideMenuCollapsed: false,
  setSideMenuCollapsed: (val) => set(() => ({ sideMenuCollapsed: val })),
}));
