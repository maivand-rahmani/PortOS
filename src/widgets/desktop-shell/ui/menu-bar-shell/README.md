# menu-bar-shell

Animated menu bar surface wrapper for the desktop shell.

## Files

- `menu-bar-shell.tsx` — wraps MacMenuBar in a motion container with slide-down entrance/exit animations, gated by boot state and fullscreen chrome reveal.

The menu bar slides down from the top edge during normal desktop presentation and auto-hides during fullscreen workspaces unless the pointer is near the screen edge.
