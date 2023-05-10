import { create } from "zustand";

interface GlobalState {
  sideMenuCollapsed: boolean;
  setSideMenuCollapsed: (val: boolean) => void;
  hideLogin: boolean;
  setHideLogin: (val: boolean) => void;
}
export const useGlobalStore = create<GlobalState>((set) => ({
  sideMenuCollapsed: false,
  setSideMenuCollapsed: (val: boolean) =>
    set(() => ({ sideMenuCollapsed: val })),
  hideLogin: true,
  setHideLogin: (val: boolean) => set(() => ({ hideLogin: val })),
}));
