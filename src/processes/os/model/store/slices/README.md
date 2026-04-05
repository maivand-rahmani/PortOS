# slices

Zustand slice modules for the OS store.

Each slice owns a specific domain of the OS runtime state. They are composed into the single `OSStore` type via `create<OSStore>()` in `../store.ts`.

## Pattern

Every slice uses `StateCreator<OSStore, [], [], SliceType>` where `SliceType` is a `Pick<OSStore, ...>` of the fields and actions that slice owns. This avoids re-defining types and keeps the full store type as the single source of truth in `../store.types.ts`.

## Files

| File | Domain | Risk |
|------|--------|------|
| `helpers.ts` | Pure helpers: `DEFAULT_LAUNCH_BOUNDS`, `collapseSplitWorkspaceForWindow`, `applySettingsToDOM` | N/A — no store ref |
| `fs-path-helpers.ts` | Store-aware fs path helpers that accept `get: () => OSStore` to avoid circular imports | N/A |
| `boot.slice.ts` | Boot phase, progress, messages | Low |
| `notification.slice.ts` | Notifications and toast queue | Low |
| `shortcut.slice.ts` | Keyboard shortcut registry | Low |
| `wallpaper.slice.ts` | Wallpaper ID and custom wallpaper data URL | Medium |
| `settings.slice.ts` | OS settings, DOM side-effects, persistence | Medium |
| `file-system.slice.ts` | Virtual filesystem (nodes, clipboard, search) + file drag state | Medium |
| `session.slice.ts` | Session hydration and snapshot persistence | High (cross-domain) |
| `workspace.slice.ts` | Workspaces, split view, fullscreen spaces | High (cross-domain) |
| `window.slice.ts` | Window manager state, drag, resize, snap, fullscreen, close | High (cross-domain) |
| `app.slice.ts` | App registry, process manager, launch/activate | High (cross-domain) |

## Dependency rules

- Slices import from `../store.types` (not from `../store`) to get the `OSStore` type — avoids circular deps.
- `helpers.ts` and `fs-path-helpers.ts` must never import from slice files.
- Cross-cutting actions (e.g. `closeWindow` touching windows + processes + workspaces) are valid because each slice's `set` and `get` see the full `OSStore`.
