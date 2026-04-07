/**
 * Keyboard shortcut type definitions for the OS-level shortcut system.
 *
 * Shortcuts are registered globally and dispatched by a single keydown
 * listener at the desktop-shell level, preventing conflicts and enabling
 * a centralized override/priority system.
 */

/** Modifier keys used in shortcut combos. */
export type ShortcutModifier = "meta" | "ctrl" | "alt" | "shift";

export type ShortcutSequenceKey =
  | "space"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type ShortcutPresetId =
  | "os:spotlight"
  | "os:mission-control"
  | "os:ai-palette"
  | "os:app-switcher"
  | "os:close-window"
  | "os:minimize-window"
  | "os:quit-app"
  | "os:hide-app"
  | "os:cycle-window"
  | "os:workspace-1"
  | "os:workspace-2"
  | "os:workspace-3"
  | "os:space-left"
  | "os:space-right";

export type ShortcutBindingCombo = {
  kind: "combo";
  key: string;
  modifiers: ShortcutModifier[];
};

export type ShortcutBindingSequence = {
  kind: "sequence";
  steps: ShortcutSequenceKey[];
};

export type ShortcutBinding = ShortcutBindingCombo | ShortcutBindingSequence;

export type SystemShortcutBinding = {
  id: ShortcutPresetId;
  label: string;
  scope: "global" | "app";
  binding: ShortcutBinding;
};

export type SystemShortcutBindings = Record<ShortcutPresetId, ShortcutBinding>;

/**
 * A single keyboard shortcut registration.
 *
 * `key` uses the `KeyboardEvent.key` value (case-insensitive match).
 * `modifiers` lists required modifier keys.
 */
export type Shortcut = {
  /** Unique identifier for this shortcut. */
  id: string;
  /** Human-readable description shown in UI (e.g. "Close window"). */
  label: string;
  /** The key value (KeyboardEvent.key, case-insensitive). */
  key: string;
  /** Required modifier keys. */
  modifiers: ShortcutModifier[];
  /**
   * Scope determines when this shortcut is active.
   * - "global": always active when OS is ready
   * - "app": only active when a window is focused
   */
  scope: "global" | "app";
  /** Whether to call `event.preventDefault()` on match. Defaults to true. */
  preventDefault?: boolean;
  /** The action to execute when the shortcut fires. */
  action: () => void;
};

/**
 * Shortcut manager state stored in the Zustand slice.
 * The registry is a simple array; lookups are fast enough for <100 shortcuts.
 */
export type ShortcutManagerState = {
  shortcuts: Shortcut[];
};
