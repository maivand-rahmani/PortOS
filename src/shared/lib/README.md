# lib

Non-visual shared utilities.

## Files

- `agent-os-events.ts`: window-level events used by the AI agent to prefill other apps.
- `blog-os-events.ts`: window-level request bridge for focusing the Blog reader on a post or queued reading flow.
- `cn.ts`: merges conditional class names and resolves Tailwind conflicts.
- `clock-os-events.ts`: window-level request bridge for focusing a timezone inside the active Clock window.
- `fs-events.ts`: transient filesystem change events emitted from OS store mutations for UI and repository sync.
- `fs-paths.ts`: canonical `/System/*` paths for app, user, shared, and cache-backed storage.
- `index.ts`: barrel exports for shared utilities.
- `fs-actions.ts`: path-based filesystem wrappers and JSON/file helpers built on the OS store.
- `docs.ts`: shared helpers for docs navigation and heading ids.
- `files-os-events.ts`: Files app reveal/focus requests backed by in-memory window events.
- `fs-migration.ts`: one-time migration helpers that import legacy browser persistence into filesystem files.
- `fs-os-events.ts`: file open/save request bridge backed by in-memory window events.
- `idb-storage.ts`: IndexedDB persistence for filesystem nodes, contents, and export/clear operations.
- `notes-os-events.ts`: window-level request bridge for creating or updating notes from other apps.
- `os-actions.ts`: runtime helpers that let apps open apps and manage windows/processes.
- `portfolio-os-events.ts`: typed window-level requests for focusing the Portfolio app on a case study or handoff mode.
- `project-data.ts`: typed access to profile basics used by the easy app set.
- `resume-os-events.ts`: typed window-level requests for focusing the Resume app on a lens, section, or project.
- `system-info-os-events.ts`: typed window-level requests for steering System Info toward a process, window, or incident snapshot.
- `terminal-os-events.ts`: typed window-level events for sending terminal requests into the active terminal window.
- `window-request-bus.ts`: shared in-memory request queue used by window-level request bridges.

Utilities here should remain framework-light and reusable across features, widgets, and apps.
