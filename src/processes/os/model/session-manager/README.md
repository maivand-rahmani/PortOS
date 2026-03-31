# session-manager

Window session serialization and restore helpers for the OS runtime.

## Files

- `session-manager.types.ts` - persisted session contracts and slice state.
- `index.ts` - pure helpers for serializing window layout and restoring it into runtime state.

The shell debounces session saves, while this model layer owns the snapshot format and restore sanitization against current desktop bounds.
