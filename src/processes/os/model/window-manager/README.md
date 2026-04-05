# window-manager

Typed OS window manager model.

## Files

- `index.ts`: public window manager API composed from focused helpers.
- `window-manager.types.ts`: runtime drag and resize state types.
- `window-manager.helpers.ts`: frame, clamping, replacement, fullscreen/maximize helpers, and split-pane layout helpers.
- `window-manager.resize.ts`: edge and corner resize helpers.

This module is the single source of truth for runtime window instances, including desktop-local maximize, dedicated fullscreen-space behavior, and split-pane layout application.
