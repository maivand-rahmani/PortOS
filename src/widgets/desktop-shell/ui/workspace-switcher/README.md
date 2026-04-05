# workspace-switcher

Compact shell-level control for switching virtual desktops and fullscreen spaces.

## Files

- `workspace-switcher.tsx` - renders a centered segmented control for the available desktop and fullscreen workspaces.

The component is presentational. The OS runtime owns the actual workspace state, fullscreen-space creation, and active window reassignment.
