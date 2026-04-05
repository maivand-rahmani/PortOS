import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import type { OSBootPhase } from "../store.types";

export type BootSlice = Pick<
  OSStore,
  | "bootPhase"
  | "bootProgress"
  | "bootMessages"
  | "setBootPhase"
  | "setBootProgress"
  | "addBootMessage"
  | "completeBoot"
>;

export const createBootSlice: StateCreator<OSStore, [], [], BootSlice> = (set) => ({
  bootPhase: "off" as OSBootPhase,
  bootProgress: 0,
  bootMessages: [],

  setBootPhase: (phase) => {
    set({ bootPhase: phase });
  },

  setBootProgress: (progress) => {
    set({
      bootProgress: Math.max(0, Math.min(100, progress)),
    });
  },

  addBootMessage: (message) => {
    set((state) => ({
      bootMessages: [...state.bootMessages, message],
    }));
  },

  completeBoot: () => {
    set({
      bootPhase: "ready",
      bootProgress: 100,
    });
  },
});
