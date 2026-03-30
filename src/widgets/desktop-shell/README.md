# desktop-shell

macOS-style desktop shell widget for the main Portfolio OS page.

## Folders and files

- `index.ts`: public export for the desktop shell widget.
- `model/`: shell-level state orchestration, constants, derived desktop data, and status bar command modeling.
- `ui/`: visual shell components such as the dock, persistent status bar, icons, wallpaper, boot overlay, windows, and AI attraction surfaces.

This widget composes the desktop experience from smaller files instead of keeping shell logic in one large component. It now also owns the desktop-level AI attraction layer and persistent system status bar that keep the agent and shell actions visible on first load.
