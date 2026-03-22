# model

Runtime state models and contracts for the OS core.

## Folders and files

- `window-manager/`: typed window state helpers for opening, focusing, and closing windows.
- `process-manager/`: typed process state helpers for starting, linking, and stopping processes.
- `app-registry/`: typed app metadata and lazy-loading helpers.
- `store.ts`: Zustand runtime store that composes the managers into one OS state.
- `index.ts`: barrel exports for the runtime model layer.

This folder now holds the step-3 OS core implementation.
