# src

Primary application source for Portfolio OS.

## Folders

- `app/`: Next.js application layer, routes, layouts, and global styles.
- `processes/`: OS runtime orchestration and system-level state models.
- `widgets/`: composed interface blocks such as windows, docks, and taskbars.
- `features/`: user-facing interactions wired to runtime state.
- `entities/`: core domain entities such as windows, apps, and processes.
- `shared/`: reusable utilities, primitives, and cross-cutting helpers.
- `apps/`: isolated application modules loaded by the OS.

Every project-owned folder inside `src/` must include a `README.md` that explains its purpose and the responsibility of its direct children.
