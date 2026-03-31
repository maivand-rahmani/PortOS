# file-system

Core file system manager for the OS runtime.

## Files

- `file-system.types.ts`: manager state shape and factory (`FileSystemManagerState`).
- `file-system.path.ts`: path parsing, normalization, resolution, validation, and traversal helpers.
- `file-system.operations.ts`: pure model functions for tree CRUD (create, delete, rename, move, copy), index building, and clipboard.
- `file-system.search.ts`: search by name, extension, and content with result state management.
- `index.ts`: barrel export for all public symbols.

## Architecture

Follows the same pure-model-function pattern as `window-manager/` and `process-manager/`. All functions are pure: they take current state and input, return new state. The Zustand store in `store.ts` wraps these with `set()` calls and adds async IndexedDB persistence via `@/shared/lib/idb-storage.ts`.

Node metadata lives in the Zustand store (in-memory) for fast tree navigation. File content lives in IndexedDB and is loaded on demand via `fsReadContent()`.
