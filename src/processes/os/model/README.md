# model

Runtime state models and contracts for the OS core.

## Folders and files

- `window-manager/`: typed window state helpers for opening, focusing, dragging, minimizing, maximizing, restoring, resizing, and closing windows.
- `process-manager/`: typed process state helpers for starting, linking, and stopping processes.
- `app-registry/`: typed app metadata and lazy-loading helpers.
- `notification-manager/`: typed notification state helpers for toast delivery, read state, and notification history.
- `runtime-selectors.ts`: derived runtime lookup helpers for active app, window, and process state.
- `store.ts`: Zustand runtime store that composes the managers into one OS state.
- `index.ts`: barrel exports for the runtime model layer.

This folder now holds the step-3 OS core implementation.
