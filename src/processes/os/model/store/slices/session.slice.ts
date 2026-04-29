import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs/fs-paths";
import {
  migratePersistedSession,
  restoreSessionModel,
  serializeSessionModel,
  sessionManagerInitialState,
  type PersistedSessionState,
  loadPersistedSession,
} from "../../session-manager";
import { writeFsJsonAtPath } from "./fs-path-helpers";

export type SessionSlice = Pick<
  OSStore,
  | "sessionHydrated"
  | "hydrateSession"
  | "persistSessionSnapshot"
>;

export const createSessionSlice: StateCreator<OSStore, [], [], SessionSlice> = (set, get) => ({
  ...sessionManagerInitialState,

  hydrateSession: async (bounds) => {
    if (typeof window === "undefined") {
      return;
    }

    const rawSession = await loadPersistedSession();

    if (!rawSession || typeof rawSession !== "object") {
      set({ sessionHydrated: true });
      return;
    }

    const session = rawSession as PersistedSessionState;
    const migratedSession = migratePersistedSession(session);

    if (!migratedSession || !Array.isArray(migratedSession.windows)) {
      set({ sessionHydrated: true });
      return;
    }

    const restored = restoreSessionModel({
      session: migratedSession,
      bounds,
      appMap: get().appMap,
      windowState: {
        windows: [],
        windowRecord: {},
        activeWindowId: null,
        nextZIndex: 100,
        dragState: null,
        resizeState: null,
      },
      processState: {
        processes: [],
        processRecord: {},
      },
    });

    for (const win of restored.windows.windows) {
      await get().loadAppComponent(win.appId);
    }

    set((state) => ({
      windows: restored.windows.windows,
      windowRecord: restored.windows.windowRecord,
      activeWindowId: restored.windows.activeWindowId,
      nextZIndex: restored.windows.nextZIndex,
      dragState: restored.windows.dragState,
      resizeState: restored.windows.resizeState,
      processes: restored.processes.processes,
      processRecord: restored.processes.processRecord,
      currentWorkspaceId: migratedSession.currentWorkspaceId ?? state.currentWorkspaceId,
      workspaces: migratedSession.workspaces,
      sessionHydrated: true,
    }));

    await get().persistSessionSnapshot(
      serializeSessionModel({
        workspaces: migratedSession.workspaces,
        windows: restored.windows.windows,
        activeWindowId: restored.windows.activeWindowId,
        currentWorkspaceId: migratedSession.currentWorkspaceId,
      }),
    );
  },

  persistSessionSnapshot: async (snapshot) => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await writeFsJsonAtPath(get, PERSISTED_FILE_PATHS.sessionSnapshot, snapshot);
    } catch (error) {
      console.error("Session persistence failed:", error);
      get().pushNotification({
        title: "System",
        body: "Failed to save session state.",
        level: "warning",
        appId: "system",
      });
    }
  },
});
