# desktop-root

Composition root for the desktop shell widget.

## Files

- `desktop-root.tsx`: combines the shell model hook with all desktop UI parts, including the sliding workspace track, Mission Control keyboard ownership, fullscreen chrome reveal behavior, and topmost split-view overlay layering.

It also hosts shell-level attraction UI such as the desktop AI teaser because those elements must be visible before any app window opens and should behave like native desktop elements.
