# store

Zustand store assembly for the OS runtime.

## Files

- **`store.ts`** — Creates the `useOSStore` hook by spreading all domain slices into a single `create<OSStore>()` call. Re-exports `OSBootPhase`, `OSRuntimeSnapshot`, and `OSStore` from `store.types.ts` for backward compatibility with the barrel.
- **`store.types.ts`** — Defines the `OSStore`, `OSBootPhase`, and `OSRuntimeSnapshot` types. Imports domain state shapes from sibling manager folders (`../app-registry`, `../window-manager`, etc.).
- **`slices/`** — Domain slices. Each slice owns a subset of `OSStore` state and actions. See `slices/README.md` for ownership details.

## Import rules

- Consumers import via the `model/index.ts` barrel — never directly from this folder.
- Slices may import from sibling manager folders (`../../window-manager`, etc.) but must not import from each other except through `helpers.ts` and `fs-path-helpers.ts`.
