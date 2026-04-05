import type { AbsolutePath } from "@/entities/file-system";

export const SYSTEM_ROOT = "/System" as AbsolutePath;
export const SYSTEM_APPS_ROOT = "/System/apps" as AbsolutePath;
export const SYSTEM_USER_ROOT = "/System/user" as AbsolutePath;
export const SYSTEM_SHARED_ROOT = "/System/shared" as AbsolutePath;
export const SYSTEM_CACHE_ROOT = "/System/cache" as AbsolutePath;

export const SYSTEM_APP_DIRECTORIES = {
  aiAgent: "/System/apps/ai-agent" as AbsolutePath,
  blog: "/System/apps/blog" as AbsolutePath,
  calculator: "/System/apps/calculator" as AbsolutePath,
  clock: "/System/apps/clock" as AbsolutePath,
  settings: "/System/apps/settings" as AbsolutePath,
  systemInfo: "/System/apps/system-info" as AbsolutePath,
  terminal: "/System/apps/terminal" as AbsolutePath,
} as const;

export const SYSTEM_USER_DIRECTORIES = {
  ai: "/System/user/ai" as AbsolutePath,
  blog: "/System/user/blog" as AbsolutePath,
  calculator: "/System/user/calculator" as AbsolutePath,
  contact: "/System/user/contact" as AbsolutePath,
  docs: "/System/user/docs" as AbsolutePath,
  notes: "/System/user/notes" as AbsolutePath,
  portfolio: "/System/user/portfolio" as AbsolutePath,
  resume: "/System/user/resume" as AbsolutePath,
  wallpapers: "/System/user/wallpapers" as AbsolutePath,
} as const;

export const SYSTEM_SHARED_DIRECTORIES = {
  session: "/System/shared/session" as AbsolutePath,
  registry: "/System/shared/registry" as AbsolutePath,
  recent: "/System/shared/recent" as AbsolutePath,
} as const;

export const SYSTEM_CACHE_DIRECTORIES = {
  previews: "/System/cache/previews" as AbsolutePath,
  search: "/System/cache/search" as AbsolutePath,
} as const;

export const PERSISTED_FILE_PATHS = {
  aiAgentHistory: "/System/apps/ai-agent/history.json" as AbsolutePath,
  blogReaderState: "/System/apps/blog/reader-state.json" as AbsolutePath,
  calculatorTape: "/System/apps/calculator/tape.json" as AbsolutePath,
  clockPreferences: "/System/apps/clock/preferences.json" as AbsolutePath,
  settingsPreferences: "/System/apps/settings/preferences.json" as AbsolutePath,
  settingsWallpaper: "/System/apps/settings/wallpaper.json" as AbsolutePath,
  terminalHistory: "/System/apps/terminal/history.json" as AbsolutePath,
  sessionSnapshot: "/System/shared/session/window-session.json" as AbsolutePath,
} as const;

export const LEGACY_FILE_PATHS = {
  aiAgentHistory: "/System/Agent/history.json" as AbsolutePath,
  blogReaderState: "/Documents/Blog/reader-state.json" as AbsolutePath,
  calculatorTape: "/Documents/Calculator/tape.json" as AbsolutePath,
  clockPreferences: "/System/Preferences/clock.json" as AbsolutePath,
  notesDirectory: "/Documents/Notes" as AbsolutePath,
  wallpaperPreferences: "/System/Preferences/wallpaper.json" as AbsolutePath,
} as const;

export const NOTES_FILE_EXTENSION = ".md" as const;
