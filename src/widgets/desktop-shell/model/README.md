# model

Shell-level model layer for the desktop widget.

## Files

- `desktop-shell.constants.ts`: desktop spacing, boot sequence, and shell motion presets.
- `desktop-shell.layout.ts`: icon layout and dock-state helpers.
- `status-bar/`: menu bar derivation and declarative command-running helpers built from runtime state.
- `desktop-shell.types.ts`: shared shell types used by the UI folders.
- `use-desktop-shell.ts`: main hook that wires desktop UI state to the OS runtime store.
- `use-app-switcher.ts`: app switcher interaction hook for cycling and activating running apps from a shell-level overlay.

The shell model now also owns shell-level launch flows such as opening the AI agent with guided prompts from the desktop teaser, cycling running apps through the app switcher overlay, and debounced session persistence once the desktop is hydrated.

Keep desktop coordination logic here so UI components stay small and focused.
