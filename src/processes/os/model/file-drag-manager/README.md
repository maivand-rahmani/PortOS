# file-drag-manager

System-wide file drag state for cross-app drop zones.

## Files

- `file-drag-manager.types.ts` - drag-state and drop-target contracts.
- `index.ts` - pure helpers for starting, updating, targeting, and ending a file drag.

This slice lets the shell own drag overlays while apps only opt into supported drop targets.
