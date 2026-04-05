# lib

Non-visual shared utilities, organized into focused subfolders.

## Subfolders

- `cn/`: class name merging utility (clsx + tailwind-merge).
- `fs/`: filesystem paths, events, actions, storage adapters, and migration helpers.
- `os-events/`: typed window-level event bridges for cross-app communication.
- `os-actions/`: runtime helpers that let apps open apps and manage windows/processes.
- `app-data/`: static app content — blog posts, docs helpers, project profile, and wallpapers.

## Key file

- `index.ts`: barrel that re-exports the public surface of all five subfolders.

Utilities here remain framework-light and reusable across features, widgets, and apps.
