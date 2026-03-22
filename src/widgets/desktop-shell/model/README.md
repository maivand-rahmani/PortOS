# model

Shell-level model layer for the desktop widget.

## Files

- `desktop-shell.constants.ts`: desktop spacing, boot sequence, and shell motion presets.
- `desktop-shell.layout.ts`: icon layout and dock-state helpers.
- `desktop-shell.types.ts`: shared shell types used by the UI folders.
- `use-desktop-shell.ts`: main hook that wires desktop UI state to the OS runtime store.

Keep desktop coordination logic here so UI components stay small and focused.
