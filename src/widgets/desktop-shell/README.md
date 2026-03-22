# desktop-shell

macOS-style desktop shell widget for the main Portfolio OS page.

## Folders and files

- `index.ts`: public export for the desktop shell widget.
- `model/`: shell-level state orchestration, constants, and derived desktop data.
- `ui/`: visual shell components such as the dock, menu bar, icons, wallpaper, boot overlay, and windows.

This widget composes the desktop experience from smaller files instead of keeping shell logic in one large component.
