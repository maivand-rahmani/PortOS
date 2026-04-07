# AI Command Palette

Global overlay widget for the OS-level AI command palette, triggered by **Space+K**.

## Structure

| File | Purpose |
|---|---|
| `ai-command-palette.tsx` | Main overlay component and viewport-centered panel placement logic |
| `ai-command-palette-panel.tsx` | Split-pane palette UI orchestrator (action rail, composer, response area) |
| `context-card.tsx` | Presentational component for the active context summary |
| `action-card.tsx` | Presentational component for an individual action button in the rail |
| `message-list.tsx` | Chat-style transcript view with empty state and managed auto-scroll |
| `preview-body.tsx` | Legacy idle/loading/result dispatcher kept for compatibility while the chat transcript owns the main response area |
| `ai-command-palette.helpers.tsx` | Smaller UI helpers and formatting pure functions |
| `index.ts` | Barrel export |

## Behavior

1. Opens when `aiPaletteOpen` is true in the Zustand store (set by sequence shortcut in desktop-root)
2. Shows available AI actions filtered by the source app context
3. User picks an action and optionally adds a prompt
4. Streams the AI response in real time
5. User can apply the result (replace file or create new file) or dismiss
6. Capability and apply behavior are derived from the published AI context for the active window
7. The conversation pane scrolls independently from the action rail and composer, and keeps auto-scroll only while the user stays near the latest message

## Data flow

- Reads from: `useOSStore` (`aiPaletteOpen`, `aiPaletteContext`, `aiStatus`, `aiStreamContent`, `aiLastResult`, `aiError`)
- Writes via: `aiExecuteAction`, `aiApplyResult`, `aiClosePalette`, `aiCancelRequest`, `aiClearResult`
