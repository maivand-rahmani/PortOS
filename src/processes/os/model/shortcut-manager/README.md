# Shortcut Manager

OS-level keyboard shortcut registry and dispatcher.

## What this folder owns

- Type definitions for runtime shortcuts, system shortcut presets, combo bindings, and sequence bindings
- Pure model functions for registering, unregistering, and matching combo shortcuts
- Pure helpers for formatting bindings, matching key sequences, and detecting user-config conflicts

## Files

- `shortcut-manager.types.ts` — runtime shortcut types plus system-level binding and preset types
- `index.ts` — combo registry helpers, binding formatting, sequence matching, and conflict detection

## Integration

The desktop shell hook (`use-desktop-shell.ts`) owns the single `keydown` listener
and calls `matchShortcut` to dispatch. Apps should not add their own global
keyboard listeners — they register shortcuts through the store instead.
