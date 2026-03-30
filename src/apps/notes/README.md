# notes

Hand-drawn notebook-style notes app with local persistence, tagging, pinning, filtered browsing, external note intake, and lightweight checklist tracking.

## Folders and files

- `index.ts`: app metadata, status bar actions, and lazy loader.
- `model/`: note types, normalization, browser persistence, and external request helpers.
- `theme.css`: notebook paper texture and ruled-page visuals for the app shell.
- `ui/`: sketch-style notes workspace with sidebar filters, page duplication, and progress-aware editing.

## External integration

- `dispatchNotesExternalRequest(detail)`: sends a note request event that the active Notes window can consume.
- `openNotesWithRequest(detail)`: shared OS helper that opens or focuses Notes, then delivers the request to the resulting window.
- Request mode supports `create` for a fresh note and `upsert` to append content into an existing note by `id` or title.
