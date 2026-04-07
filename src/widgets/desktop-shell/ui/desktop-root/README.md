# desktop-root

Composition root for the desktop shell widget.

## Files

- `desktop-root.tsx`: combines the shell model hook with all desktop UI parts, including the sliding workspace track, Mission Control keyboard ownership, fullscreen chrome reveal behavior, topmost split-view overlay layering, and shell-level AI palette rendering.

It also hosts shell-level attraction UI such as the desktop AI teaser and the OS AI palette trigger wiring because those elements must be visible before any app window opens and should behave like native desktop elements.
