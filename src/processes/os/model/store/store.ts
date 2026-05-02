"use client";

import { create } from "zustand";
import { devtools } from 'zustand/middleware'

import type { OSStore } from "./store.types";
import { createBootSlice } from "./slices/boot.slice";
import { createNotificationSlice } from "./slices/notification.slice";
import { createShortcutSlice } from "./slices/shortcut.slice";
import { createWallpaperSlice } from "./slices/wallpaper.slice";
import { createSettingsSlice } from "./slices/settings.slice";
import { createFileSystemSlice } from "./slices/file-system.slice";
import { createSessionSlice } from "./slices/session.slice";
import { createWorkspaceSlice } from "./slices/workspace.slice";
import { createWindowSlice } from "./slices/window.slice";
import { createAppSlice } from "./slices/app.slice";
import { createAiServiceSlice } from "./slices/ai-service.slice";
import { createDesktopSlice } from "./slices/desktop.slice";

export type { OSBootPhase, OSRuntimeSnapshot, OSStore } from "./store.types";

export const useOSStore = create<OSStore>()(devtools((set, get, api) => ({
  ...createBootSlice(set, get, api),
  ...createNotificationSlice(set, get, api),
  ...createShortcutSlice(set, get, api),
  ...createWallpaperSlice(set, get, api),
  ...createSettingsSlice(set, get, api),
  ...createFileSystemSlice(set, get, api),
  ...createSessionSlice(set, get, api),
  ...createWorkspaceSlice(set, get, api),
  ...createWindowSlice(set, get, api),
  ...createAppSlice(set, get, api),
  ...createAiServiceSlice(set, get, api),
  ...createDesktopSlice(set, get, api),
})));
