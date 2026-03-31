# Shortcut Manager

OS-level keyboard shortcut registry and dispatcher.

## What this folder owns

- Type definitions for shortcuts (key combos, modifiers, scopes)
- Pure model functions for registering, unregistering, and matching shortcuts
- Display formatting for shortcut labels (e.g. "⌘ W")

## Files

- `shortcut-manager.types.ts` — `Shortcut`, `ShortcutModifier`, `ShortcutManagerState`
- `index.ts` — `registerShortcutModel`, `unregisterShortcutModel`, `matchShortcut`, `formatShortcut`

## Integration

The desktop shell hook (`use-desktop-shell.ts`) owns the single `keydown` listener
and calls `matchShortcut` to dispatch. Apps should not add their own global
keyboard listeners — they register shortcuts through the store instead.
