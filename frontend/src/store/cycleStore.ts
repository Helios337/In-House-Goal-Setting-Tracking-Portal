import { create } from "zustand";

export type CycleWindow = 
  | "Phase 1 - Goal Setting" 
  | "Q1 Check-in" 
  | "Q2 Check-in" 
  | "Q3 Check-in" 
  | "Q4 / Annual" 
  | "Closed";

interface CycleState {
  activeWindow: CycleWindow;
  isOpen: boolean;
  startDate: string | null;
  endDate: string | null;

  // Actions
  setCycle: (window: CycleWindow, isOpen: boolean, start?: string | null, end?: string | null) => void;
  closeCycle: () => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  activeWindow: "Closed",
  isOpen: false,
  startDate: null,
  endDate: null,

  setCycle: (window, isOpen, start = null, end = null) => set({ 
    activeWindow: window, 
    isOpen, 
    startDate: start, 
    endDate: end 
  }),

  closeCycle: () => set({ 
    activeWindow: "Closed", 
    isOpen: false, 
    startDate: null, 
    endDate: null 
  }),
}));
