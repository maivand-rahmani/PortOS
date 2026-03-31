import type {
  Shortcut,
  ShortcutManagerState,
  ShortcutModifier,
} from "./shortcut-manager.types";

export type { ShortcutManagerState } from "./shortcut-manager.types";

// ── Initial state ────────────────────────────────────────────────────────────

export const shortcutManagerInitialState: ShortcutManagerState = {
  shortcuts: [],
};

// ── Pure model functions ─────────────────────────────────────────────────────

/**
 * Register a new shortcut. If one with the same `id` already exists,
 * it is replaced (last-write wins).
 */
export function registerShortcutModel(
  state: ShortcutManagerState,
  shortcut: Shortcut,
): ShortcutManagerState {
  const filtered = state.shortcuts.filter((s) => s.id !== shortcut.id);

  return { shortcuts: [...filtered, shortcut] };
}

/**
 * Register multiple shortcuts at once.
 */
export function registerShortcutsModel(
  state: ShortcutManagerState,
  shortcuts: Shortcut[],
): ShortcutManagerState {
  let next = state;

  for (const shortcut of shortcuts) {
    next = registerShortcutModel(next, shortcut);
  }

  return next;
}

/**
 * Unregister a shortcut by id.
 */
export function unregisterShortcutModel(
  state: ShortcutManagerState,
  shortcutId: string,
): ShortcutManagerState {
  return {
    shortcuts: state.shortcuts.filter((s) => s.id !== shortcutId),
  };
}

// ── Matching logic ───────────────────────────────────────────────────────────

/** Check whether all required modifiers are pressed. */
function modifiersMatch(
  event: KeyboardEvent,
  modifiers: ShortcutModifier[],
): boolean {
  const required = new Set(modifiers);

  const metaPressed = event.metaKey;
  const ctrlPressed = event.ctrlKey;
  const altPressed = event.altKey;
  const shiftPressed = event.shiftKey;

  if (required.has("meta") !== metaPressed) return false;
  if (required.has("ctrl") !== ctrlPressed) return false;
  if (required.has("alt") !== altPressed) return false;
  if (required.has("shift") !== shiftPressed) return false;

  return true;
}

/**
 * Find the first shortcut that matches a keyboard event.
 *
 * - Filters by scope: "global" shortcuts always match,
 *   "app" shortcuts only match when `hasActiveWindow` is true.
 * - Checks key (case-insensitive) + modifiers.
 */
export function matchShortcut(
  shortcuts: Shortcut[],
  event: KeyboardEvent,
  hasActiveWindow: boolean,
): Shortcut | null {
  const pressedKey = event.key.toLowerCase();

  for (const shortcut of shortcuts) {
    if (shortcut.scope === "app" && !hasActiveWindow) continue;
    if (shortcut.key.toLowerCase() !== pressedKey) continue;
    if (!modifiersMatch(event, shortcut.modifiers)) continue;

    return shortcut;
  }

  return null;
}

/**
 * Format a shortcut for display (e.g. "⌘ W", "⌘ ⇧ M").
 */
export function formatShortcut(shortcut: Shortcut): string {
  const symbols: string[] = [];

  if (shortcut.modifiers.includes("ctrl")) symbols.push("⌃");
  if (shortcut.modifiers.includes("alt")) symbols.push("⌥");
  if (shortcut.modifiers.includes("shift")) symbols.push("⇧");
  if (shortcut.modifiers.includes("meta")) symbols.push("⌘");

  const keyLabel =
    shortcut.key.length === 1
      ? shortcut.key.toUpperCase()
      : shortcut.key;

  symbols.push(keyLabel);

  return symbols.join(" ");
}
