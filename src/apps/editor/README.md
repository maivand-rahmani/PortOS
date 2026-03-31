# Editor App

Document editor for PortOS with support for multiple file types.

## Supported Modes

- **Plain Text** (`.txt`, `.csv`) — basic text editing
- **Markdown** (`.md`) — toolbar formatting + live split preview
- **JSON** (`.json`) — format/validate with syntax feedback
- **Code** (`.ts`, `.tsx`, `.js`, `.jsx`, `.html`, `.css`) — monospace editing with line numbers

## Features

- Undo/redo stack (debounced, max 100 entries)
- Auto-save (3 s debounce, toggleable)
- Save on unmount
- Keyboard shortcuts (Cmd+S, Cmd+Z, Cmd+Shift+Z, Cmd+P, Cmd+B, Cmd+I)
- Consumes `OpenFileRequest` events from the Files app

## Structure

| Path | Purpose |
|------|---------|
| `index.ts` | `AppConfig` export (`editorAppConfig`) |
| `icon.tsx` | Liquid Glass SVG icon |
| `theme.css` | CSS custom properties scoped under `.editor-app` |
| `model/` | Hook and pure types/helpers |
| `ui/` | Visual components |
