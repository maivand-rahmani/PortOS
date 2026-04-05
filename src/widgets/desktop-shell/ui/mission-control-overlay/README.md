# mission-control-overlay

Shell-level Mission Control overview shown above the desktop and spaces track.

## Files

- `index.ts`: public export for the overlay.
- `mission-control-overlay.tsx`: root overlay composition and backdrop-dismiss behavior.
- `mission-control-space-strip.tsx`: top row of space cards.
- `mission-control-workspace-preview.tsx`: large preview area for the highlighted workspace.
- `mission-control-window-thumb.tsx`: lightweight window thumbnail used in the preview.

The overlay stays presentation-focused while the shell model owns highlighted-space state, default window targeting, and keyboard confirmation behavior.
