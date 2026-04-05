# session-manager

Window session serialization, migration, and restore helpers for the OS runtime.

## Files

- `session-manager.types.ts` - persisted session contracts and slice state.
- `index.ts` - pure helpers for serializing window layout, migrating snapshots, and restoring it into runtime state.
- `session-manager.storage.ts` - filesystem-backed session load/save helpers for `/System/shared/session/window-session.json`.

The shell debounces session saves, while this model layer owns the snapshot format, fullscreen and split-workspace recovery, and restore sanitization against current desktop bounds.
