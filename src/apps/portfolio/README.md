# portfolio

Interactive portfolio app for browsing project case studies and turning the selected project into a recruiter, client, or technical handoff across PortOS.

## Folders and files

- `index.ts`: app metadata and lazy loader.
- `icon.tsx`: Portfolio app icon.
- `theme.css`: industrial skeuomorphic portfolio motion and surface styling.
- `model/`: typed project content shaping.
- `ui/`: industrial control-panel portfolio browser UI.

## External integration

- `openPortfolioWithFocus(...)` from `src/shared/lib`: opens or focuses Portfolio and targets a project, filter, or handoff mode.
- `PORTFOLIO_FOCUS_REQUEST_EVENT`: lower-level window event used by the helper.

Supported focus request fields:

- `projectId`: select a case study directly.
- `filterId`: switch the visible project queue filter.
- `handoffId`: jump into a recruiter, client, or technical handoff flow.
- `source`: optional label shown inside the app for traceability.
