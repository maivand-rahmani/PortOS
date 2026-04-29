# dock-shell

Animated dock surface wrapper for the desktop shell.

## Files

- `dock-shell.tsx` — wraps MacDock in a motion container with slide-up entrance/exit animations, gated by boot state and fullscreen chrome reveal.

The dock slides up from the bottom edge during normal desktop presentation and auto-hides during fullscreen workspaces.
