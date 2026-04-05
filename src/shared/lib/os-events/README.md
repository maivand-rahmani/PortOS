# os-events

Typed window-level event bridges for cross-app communication.

## Files

- `window-request-bus.ts`: shared in-memory request queue used by all window-level request bridges.
- `agent-os-events.ts`: window-level events used by the AI agent to prefill other apps.
- `blog-os-events.ts`: window-level request bridge for focusing the Blog reader on a post or queued reading flow.
- `clock-os-events.ts`: window-level request bridge for focusing a timezone inside the active Clock window.
- `files-os-events.ts`: Files app reveal/focus requests backed by in-memory window events.
- `fs-os-events.ts`: file open/save request bridge backed by in-memory window events.
- `notes-os-events.ts`: window-level request bridge for creating or updating notes from other apps.
- `portfolio-os-events.ts`: typed window-level requests for focusing the Portfolio app on a case study or handoff mode.
- `resume-os-events.ts`: typed window-level requests for focusing the Resume app on a lens, section, or project.
- `system-info-os-events.ts`: typed window-level requests for steering System Info toward a process, window, or incident snapshot.
- `terminal-os-events.ts`: typed window-level events for sending terminal requests into the active terminal window.
- `index.ts`: re-exports the public surface of all os-events.
