import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import {
  shortcutManagerInitialState,
  registerShortcutModel,
  registerShortcutsModel,
  unregisterShortcutModel,
} from "../../shortcut-manager";

export type ShortcutSlice = Pick<
  OSStore,
  | "shortcuts"
  | "registerShortcut"
  | "registerShortcuts"
  | "unregisterShortcut"
>;

export const createShortcutSlice: StateCreator<OSStore, [], [], ShortcutSlice> = (set, get) => ({
  ...shortcutManagerInitialState,

  registerShortcut: (shortcut) => {
    const next = registerShortcutModel(get(), shortcut);

    set({ shortcuts: next.shortcuts });
  },

  registerShortcuts: (shortcuts) => {
    const next = registerShortcutsModel(get(), shortcuts);

    set({ shortcuts: next.shortcuts });
  },

  unregisterShortcut: (shortcutId) => {
    const next = unregisterShortcutModel(get(), shortcutId);

    set({ shortcuts: next.shortcuts });
  },
});
