# terminal

Working terminal app with real command handling, runtime inspection, and app launching.

## Folders and files

- `index.ts`: app metadata and lazy loader.
- `model/`: terminal session helpers and external request bridge logic.
- `theme.css`: local terminal theme.
- `ui/`: terminal emulator component.

The terminal supports command history, autocomplete, runtime inspection, opening registered apps, and runtime window/process control.

Recent commands persist to `/System/apps/terminal/history.json` so they stay visible through the filesystem.

## External integration

- `openTerminalWithCommand(command, options?)` in `src/shared/lib/` opens Terminal, targets the active terminal window, and either prefills or auto-runs a command.
- `dispatchTerminalExternalRequest(detail)` emits the lower-level `portos:terminal-external-request` browser event used by the terminal bridge.
