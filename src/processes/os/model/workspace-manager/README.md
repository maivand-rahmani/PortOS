# workspace-manager

Virtual desktop state for the OS runtime.

## Files

- `workspace-manager.types.ts` - workspace identifiers, definitions, and slice state.
- `index.ts` - pure helpers for switching and cycling workspaces.

The runtime treats workspaces as a system concern. Windows belong to a workspace, while apps remain unaware of that grouping.
