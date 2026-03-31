export const DESKTOP_INSETS = {
  top: 42,
  right: 24,
  bottom: 120,
  left: 24,
} as const;

export const BOOT_PHASE_DURATIONS = {
  "power-on": 600,
  logo: 1400,
  init: 2500,
  reveal: 1000,
} as const;

export const BOOT_PROGRESS_KEYFRAMES = [
  { target: 25, duration: 400, message: "Initializing kernel..." },
  { target: 45, duration: 800, message: "Loading app registry [14 modules]" },
  { target: 70, duration: 600, message: "Mounting file system..." },
  { target: 75, duration: 300, message: "Hydrating settings..." },
  { target: 88, duration: 300, message: "Starting window manager..." },
  { target: 100, duration: 400, message: "System ready" },
] as const;

export const BOOT_SESSION_KEY = "portos-booted" as const;

export const DESKTOP_ICON_FRAME = {
  width: 88,
  height: 96,
} as const;

export const DESKTOP_ICON_SPACING = {
  x: 108,
  y: 108,
} as const;

export const DOCK_MENU = {
  width: 260,
  safeMargin: 18,
  verticalOffset: 18,
} as const;

export const DESKTOP_AI_WIDGET = {
  width: 340,
  height: 332,
  initialOffset: {
    x: 24,
    y: 96,
  },
} as const;

export const WINDOW_SURFACE_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 28,
} as const;
