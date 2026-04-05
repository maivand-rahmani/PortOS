# os

Core runtime for the browser-based operating system.

## Folders

- `model/`: typed runtime models, Zustand store, and OS manager helpers.
- `index.ts`: runtime exports consumed by widgets and features.

This layer is responsible for window focus, z-index ordering, process tracking, app-launch contracts, and fullscreen space management.
