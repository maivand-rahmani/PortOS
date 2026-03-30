# system-info

Live runtime monitoring app backed by the PortOS store, with diagnostics, incident export, and operator handoff flows.

## Folders and files

- `index.ts`: app metadata and lazy loader.
- `icon.tsx`: System Info app icon.
- `theme.css`: app-local newsprint theme.
- `model/`: derived metrics, typed diagnostics, action helpers, and external request handling.
- `ui/`: modular dashboard sections for overview, diagnostics, processes, and windows.
