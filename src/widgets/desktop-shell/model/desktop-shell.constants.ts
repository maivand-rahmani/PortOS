export const DESKTOP_INSETS = {
  top: 42,
  right: 24,
  bottom: 120,
  left: 24,
} as const;

export const BOOT_SEQUENCE = [18, 39, 63, 82, 100] as const;

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
