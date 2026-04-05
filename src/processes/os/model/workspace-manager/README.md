# workspace-manager

Virtual desktop, fullscreen-space, and split-view state for the OS runtime.

## Files

- `workspace-manager.types.ts` - workspace identifiers, definitions, and slice state.
- `index.ts` - pure helpers for switching, cycling, creating, removing, and updating desktop/fullscreen/split workspaces.

The runtime treats workspaces as a system concern. Windows belong to a workspace, while apps remain unaware of that grouping.
