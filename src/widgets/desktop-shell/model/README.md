# model

Shell-level model layer for the desktop widget.

## Files

- `desktop-shell.constants.ts`: desktop spacing, boot sequence, and shell motion presets.
- `desktop-shell.layout.ts`: icon layout and dock-state helpers.
- `status-bar/`: menu bar derivation and declarative command-running helpers built from runtime state.
- `desktop-shell.types.ts`: shared shell types used by the UI folders.
- `use-ai-command-palette.ts`: Space-to-Mission-Control and `Space+K` chord handling, plus active-context AI palette opening.
- `use-system-shortcuts.ts`: central shell-level execution for configurable system shortcuts across combo and sequence bindings.
- `use-desktop-shell.ts`: main orchestration hook that wires desktop UI state to the OS runtime store, including split-view picker and divider interactions.
- `use-boot-sequence.ts`: extracted boot phase state machine managing the 5-phase cinematic boot sequence (off → power-on → logo → init → reveal → ready) with fast-boot on revisit.
- `use-desktop-pointer-events.ts`: extracted pointer event handler with requestAnimationFrame gating for window drag, resize, file drag, icon drag, AI widget drag, and split-view resize.
- `use-app-switcher.ts`: app switcher interaction hook for cycling and activating running apps from a shell-level overlay.
- `use-mission-control.ts`: Mission Control overview state for highlighted spaces and keyboard-confirmed selection.

The shell model now also owns shell-level launch flows such as opening the AI agent with guided prompts from the desktop teaser, cycling running apps through the app switcher overlay, switching virtual desktops, driving Mission Control and split-view selection, and debounced session persistence once the desktop is hydrated.

Keep desktop coordination logic here so UI components stay small and focused.
