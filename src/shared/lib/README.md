# lib

Non-visual shared utilities.

## Files

- `agent-os-events.ts`: window-level events used by the AI agent to prefill other apps.
- `cn.ts`: merges conditional class names and resolves Tailwind conflicts.
- `index.ts`: barrel exports for shared utilities.
- `docs.ts`: shared helpers for docs navigation and heading ids.
- `os-actions.ts`: runtime helpers that let apps open apps and manage windows/processes.
- `project-data.ts`: typed access to profile basics used by the easy app set.

Utilities here should remain framework-light and reusable across features, widgets, and apps.
