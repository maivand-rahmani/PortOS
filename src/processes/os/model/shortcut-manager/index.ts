import type {
  Shortcut,
  ShortcutBinding,
  ShortcutBindingCombo,
  ShortcutManagerState,
  ShortcutModifier,
  ShortcutPresetId,
  ShortcutSequenceKey,
  SystemShortcutBinding,
  SystemShortcutBindings,
} from "./shortcut-manager.types";

export type { ShortcutManagerState } from "./shortcut-manager.types";

export const SYSTEM_SHORTCUTS_META: Record<
  ShortcutPresetId,
  Pick<SystemShortcutBinding, "id" | "label" | "scope">
> = {
  "os:spotlight": { id: "os:spotlight", label: "Spotlight Search", scope: "global" },
  "os:mission-control": { id: "os:mission-control", label: "Mission Control", scope: "global" },
  "os:ai-palette": { id: "os:ai-palette", label: "AI Command Palette", scope: "global" },
  "os:app-switcher": { id: "os:app-switcher", label: "App Switcher", scope: "global" },
  "os:close-window": { id: "os:close-window", label: "Close window", scope: "app" },
  "os:minimize-window": { id: "os:minimize-window", label: "Minimize window", scope: "app" },
  "os:quit-app": { id: "os:quit-app", label: "Quit app", scope: "app" },
  "os:hide-app": { id: "os:hide-app", label: "Hide app", scope: "app" },
  "os:cycle-window": { id: "os:cycle-window", label: "Next window", scope: "global" },
  "os:workspace-1": { id: "os:workspace-1", label: "Switch to Desktop 1", scope: "global" },
  "os:workspace-2": { id: "os:workspace-2", label: "Switch to Desktop 2", scope: "global" },
  "os:workspace-3": { id: "os:workspace-3", label: "Switch to Desktop 3", scope: "global" },
  "os:space-left": { id: "os:space-left", label: "Previous space", scope: "global" },
  "os:space-right": { id: "os:space-right", label: "Next space", scope: "global" },
};

export const DEFAULT_SYSTEM_SHORTCUT_BINDINGS: SystemShortcutBindings = {
  "os:spotlight": { kind: "combo", key: "k", modifiers: ["meta"] },
  "os:mission-control": { kind: "sequence", steps: ["space", "space"] },
  "os:ai-palette": { kind: "sequence", steps: ["space", "k"] },
  "os:app-switcher": { kind: "combo", key: "Tab", modifiers: ["alt"] },
  "os:close-window": { kind: "combo", key: "w", modifiers: ["meta"] },
  "os:minimize-window": { kind: "combo", key: "m", modifiers: ["meta"] },
  "os:quit-app": { kind: "combo", key: "q", modifiers: ["meta"] },
  "os:hide-app": { kind: "combo", key: "h", modifiers: ["meta"] },
  "os:cycle-window": { kind: "combo", key: "`", modifiers: ["meta"] },
  "os:workspace-1": { kind: "combo", key: "1", modifiers: ["ctrl", "alt"] },
  "os:workspace-2": { kind: "combo", key: "2", modifiers: ["ctrl", "alt"] },
  "os:workspace-3": { kind: "combo", key: "3", modifiers: ["ctrl", "alt"] },
  "os:space-left": { kind: "combo", key: "ArrowLeft", modifiers: ["ctrl"] },
  "os:space-right": { kind: "combo", key: "ArrowRight", modifiers: ["ctrl"] },
};

export const SEQUENCE_SHORTCUT_TIMEOUT_MS = 320;

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

export function getSystemShortcutBindings(
  bindings: SystemShortcutBindings,
): SystemShortcutBinding[] {
  return Object.values(SYSTEM_SHORTCUTS_META).map((meta) => ({
    ...meta,
    binding: bindings[meta.id],
  }));
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

function normalizeModifierList(modifiers: ShortcutModifier[]): ShortcutModifier[] {
  return [...modifiers].sort();
}

function normalizeBinding(binding: ShortcutBinding): ShortcutBinding {
  if (binding.kind === "combo") {
    return {
      ...binding,
      key: binding.key,
      modifiers: normalizeModifierList(binding.modifiers),
    };
  }

  return {
    ...binding,
    steps: [...binding.steps],
  };
}

function normalizeComboKey(key: string): string {
  if (key === " " || key.toLowerCase() === "space") {
    return "space";
  }

  return key.toLowerCase();
}

export function formatShortcutBinding(binding: ShortcutBinding): string {
  if (binding.kind === "sequence") {
    return binding.steps.map(formatSequenceStep).join(" then ");
  }

  return formatShortcut({
    id: "preview",
    label: "Preview",
    key: binding.key,
    modifiers: binding.modifiers,
    scope: "global",
    action: () => {},
  });
}

export function getSequenceStepKeyLabel(step: ShortcutSequenceKey): string {
  return step === "space" ? "Space" : step.toUpperCase();
}

function formatSequenceStep(step: ShortcutSequenceKey): string {
  return step === "space" ? "Space" : step.toUpperCase();
}

export function bindingMatchesEvent(
  binding: ShortcutBindingCombo | undefined,
  event: KeyboardEvent,
): boolean {
  if (!binding) {
    return false;
  }

  return normalizeComboKey(binding.key) === normalizeComboKey(event.key) && modifiersMatch(event, binding.modifiers);
}

export function getSequenceEventKey(event: KeyboardEvent): ShortcutSequenceKey | null {
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) {
    return null;
  }

  if (event.key === " " || event.code === "Space") {
    return "space";
  }

  if (event.key.length === 1 && /[a-z]/i.test(event.key)) {
    return event.key.toLowerCase() as ShortcutSequenceKey;
  }

  return null;
}

export function matchSequenceBinding(
  binding: ShortcutBinding | undefined,
  steps: ShortcutSequenceKey[],
): boolean {
  if (!binding || binding.kind !== "sequence") {
    return false;
  }

  if (binding.steps.length !== steps.length) {
    return false;
  }

  return binding.steps.every((step, index) => step === steps[index]);
}

export function detectShortcutBindingConflict(
  bindings: SystemShortcutBindings,
  nextId: ShortcutPresetId,
  nextBinding: ShortcutBinding,
): ShortcutPresetId | null {
  const normalizedNext = normalizeBinding(nextBinding);

  for (const [id, binding] of Object.entries(bindings) as Array<[ShortcutPresetId, ShortcutBinding]>) {
    if (id === nextId) {
      continue;
    }

    const normalizedCurrent = normalizeBinding(binding);

    if (JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedNext)) {
      return id;
    }
  }

  return null;
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
  const pressedKey = normalizeComboKey(event.key);

  for (const shortcut of shortcuts) {
    if (shortcut.scope === "app" && !hasActiveWindow) continue;
    if (normalizeComboKey(shortcut.key) !== pressedKey) continue;
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
    shortcut.key === " " || shortcut.key.toLowerCase() === "space"
      ? "Space"
      : shortcut.key.length === 1
      ? shortcut.key.toUpperCase()
      : shortcut.key;

  symbols.push(keyLabel);

  return symbols.join(" ");
}
