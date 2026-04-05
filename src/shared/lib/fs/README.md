# fs

Filesystem utilities — paths, events, actions, storage adapters, and migration.

## Files

- `fs-paths.ts`: canonical `/System/*` paths for app, user, shared, and cache-backed storage.
- `fs-events.ts`: transient filesystem change events emitted from OS store mutations for UI and repository sync.
- `fs-actions.ts`: path-based filesystem wrappers and JSON/file helpers built on the OS store.
- `fs-file-storage.ts`: file-backed persistence helpers for reading and writing typed JSON to the virtual FS.
- `fs-migration.ts`: one-time migration helpers that import legacy browser persistence into filesystem files.
- `idb-storage.ts`: IndexedDB persistence for filesystem nodes, contents, and export/clear operations.
- `index.ts`: re-exports the public surface of all fs utilities.
