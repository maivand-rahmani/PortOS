# settings/model

State and persistence layer for the Settings app.

## Files

- `settings.types.ts` — `OSSettings` type, defaults, accent mappings, and dock size mappings.
- `settings.idb.ts` — Filesystem-backed wrappers for loading and saving preferences and wallpaper state under `/System/apps/settings/`.
- `use-settings-app.ts` — React hook that reads OS settings from the store and exposes typed updater callbacks for all settings sections.
