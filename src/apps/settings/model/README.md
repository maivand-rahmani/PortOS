# settings/model

State and persistence layer for the Settings app.

## Files

- `settings.types.ts` — `OSSettings` type, `DEFAULT_OS_SETTINGS`, `ACCENT_COLOR_MAP`, `DOCK_ICON_SIZE_MAP`, IDB key constants.
- `settings.idb.ts` — Thin wrappers over `idb-storage` for loading and saving settings and custom wallpaper data URLs.
- `use-settings-app.ts` — React hook that reads OS settings from the store and exposes typed updater callbacks for all settings sections.
