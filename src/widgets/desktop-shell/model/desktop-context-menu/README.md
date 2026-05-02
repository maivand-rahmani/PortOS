# desktop-context-menu

Context menu model for the desktop shell.

## Files

- `desktop-context-menu.types.ts`: shared types for the context menu system — `DesktopItem` (app or FS node on the desktop), `ContextMenuTarget` (what was right-clicked), `ContextMenuState` (the full menu state), `ContextMenuItem` (menu entry), `SortConfig`, and `ViewMode`.
- `desktop-context-menu.constants.ts`: menu definitions for desktop background actions and FS item actions.
- `use-desktop-context-menu.ts`: hook managing the context menu open/close lifecycle, menu item derivation from the target, and all action execution against the VFS store.
- `index.ts`: barrel re-export.

The hook is consumed by `use-desktop-shell.ts` and the menu items are rendered by `DesktopContextMenu` in `ui/desktop-context-menu/`.
