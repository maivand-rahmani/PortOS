# lib

Non-visual shared utilities.

## Files

- `agent-os-events.ts`: window-level events used by the AI agent to prefill other apps.
- `cn.ts`: merges conditional class names and resolves Tailwind conflicts.
- `clock-os-events.ts`: window-level request bridge for focusing a timezone inside the active Clock window.
- `index.ts`: barrel exports for shared utilities.
- `docs.ts`: shared helpers for docs navigation and heading ids.
- `notes-os-events.ts`: window-level request bridge for creating or updating notes from other apps.
- `os-actions.ts`: runtime helpers that let apps open apps and manage windows/processes.
- `portfolio-os-events.ts`: typed window-level requests for focusing the Portfolio app on a case study or handoff mode.
- `project-data.ts`: typed access to profile basics used by the easy app set.
- `resume-os-events.ts`: typed window-level requests for focusing the Resume app on a lens, section, or project.
- `terminal-os-events.ts`: typed window-level events for sending terminal requests into the active terminal window.

Utilities here should remain framework-light and reusable across features, widgets, and apps.
