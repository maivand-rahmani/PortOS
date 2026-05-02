import type { StateCreator } from "zustand";

import type { OSStore } from "../store.types";
import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs/fs-paths";
import { readFsJsonAtPath } from "@/shared/lib/fs/fs-file-storage";
import { writeFsJsonAtPath } from "./fs-path-helpers";

import {
  desktopManagerInitialState,
  DEFAULT_DESKTOP_SORT,
  DEFAULT_DESKTOP_VIEW_MODE,
} from "../../desktop-manager";

import type {
  CleanUpMode,
  DesktopIconMap,
  DesktopRenameState,
  SortConfig,
  ViewMode,
} from "../../desktop-manager";

/** Trailing debounce timer for persistDesktopPositions */
let _persistTimer: ReturnType<typeof setTimeout> | null = null;
const PERSIST_DEBOUNCE_MS = 300;

export type DesktopSlice = Pick<
  OSStore,
  | "desktopIconPositions"
  | "desktopSelection"
  | "desktopSelections"
  | "desktopLastClicked"
  | "desktopCleanUpMode"
  | "desktopLayoutDirty"
  | "desktopSort"
  | "desktopViewMode"
  | "desktopRenameState"
  | "desktopHydrated"
  | "setDesktopIconPositions"
  | "setDesktopSelection"
  | "setDesktopSelections"
  | "toggleDesktopSelection"
  | "setRangeSelection"
  | "clearDesktopSelections"
  | "setDesktopLastClicked"
  | "setDesktopCleanUpMode"
  | "markDesktopLayoutDirty"
  | "clearDesktopSelection"
  | "setDesktopSort"
  | "setDesktopViewMode"
  | "startDesktopRename"
  | "commitDesktopRename"
  | "cancelDesktopRename"
  | "hydrateDesktopState"
  | "persistDesktopPositions"
>;

export const createDesktopSlice: StateCreator<OSStore, [], [], DesktopSlice> = (set, get) => ({
  ...desktopManagerInitialState,

  hydrateDesktopState: async () => {
    if (typeof window === "undefined") return;

    try {
      const positions = await readFsJsonAtPath<DesktopIconMap>(
        PERSISTED_FILE_PATHS.desktopPositions,
      );

      if (positions && typeof positions === "object") {
        set({
          desktopIconPositions: positions,
          desktopHydrated: true,
        });
      } else {
        set({ desktopHydrated: true });
      }
    } catch {
      set({ desktopHydrated: true });
    }
  },

  persistDesktopPositions: () => {
    if (typeof window === "undefined") return Promise.resolve();

    if (_persistTimer) {
      clearTimeout(_persistTimer);
    }

    return new Promise<void>((resolve) => {
      _persistTimer = setTimeout(async () => {
        _persistTimer = null;

        try {
          await writeFsJsonAtPath(get, PERSISTED_FILE_PATHS.desktopPositions, get().desktopIconPositions);
        } catch (error) {
          console.error("Desktop position persistence failed:", error);
        }

        resolve();
      }, PERSIST_DEBOUNCE_MS);
    });
  },

  setDesktopIconPositions: (positions: DesktopIconMap | ((prev: DesktopIconMap) => DesktopIconMap)) => {
    if (typeof positions === "function") {
      const current = get().desktopIconPositions;
      const next = positions(current);
      set({ desktopIconPositions: next });
    } else {
      set({ desktopIconPositions: positions });
    }
  },

  setDesktopSelection: (itemId: string | null) => {
    set({
      desktopSelection: itemId,
      desktopSelections: itemId ? [itemId] : [],
      desktopLastClicked: itemId,
    });
  },

  setDesktopSelections: (ids: string[]) => {
    set({
      desktopSelections: ids,
      desktopSelection: ids[0] ?? null,
    });
  },

  toggleDesktopSelection: (id: string) => {
    const current = get().desktopSelections;
    if (current.includes(id)) {
      const next = current.filter((s) => s !== id);
      set({
        desktopSelections: next,
        desktopSelection: next[0] ?? null,
        desktopLastClicked: id,
      });
    } else {
      const next = [...current, id];
      set({
        desktopSelections: next,
        desktopSelection: next[0] ?? null,
        desktopLastClicked: id,
      });
    }
  },

  setRangeSelection: (fromId: string, toId: string, allItemIds: string[]) => {
    const fromIndex = allItemIds.indexOf(fromId);
    const toIndex = allItemIds.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const ids = allItemIds.slice(start, end + 1);
    set({
      desktopSelections: ids,
      desktopSelection: ids[0] ?? null,
      desktopLastClicked: toId,
    });
  },

  clearDesktopSelections: () => {
    set({
      desktopSelections: [],
      desktopSelection: null,
    });
  },

  clearDesktopSelection: () => {
    set({
      desktopSelections: [],
      desktopSelection: null,
    });
  },

  setDesktopLastClicked: (id: string | null) => {
    set({ desktopLastClicked: id });
  },

  setDesktopCleanUpMode: (mode: CleanUpMode) => {
    set({ desktopCleanUpMode: mode });
  },

  markDesktopLayoutDirty: () => {
    set({ desktopLayoutDirty: true });
  },

  setDesktopSort: (sort: SortConfig) => {
    set({ desktopSort: sort });
  },

  setDesktopViewMode: (mode: ViewMode) => {
    set({ desktopViewMode: mode });
  },

  startDesktopRename: (itemId: string, currentName: string) => {
    set({ desktopRenameState: { itemId, currentName } });
  },

  commitDesktopRename: async () => {
    const renameState = get().desktopRenameState;
    if (!renameState) return;

    const { itemId } = renameState;
    // The rename input updates renameState.currentName live
    // and commitDesktopRename reads from the latest store value
  },

  cancelDesktopRename: () => {
    set({ desktopRenameState: null });
  },
});
