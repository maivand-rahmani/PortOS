# settings/ui/sections

Isolated section components rendered in the Settings app content pane. Each section receives only the slice of `UseSettingsAppResult` it needs.

## Files

- `wallpaper-section.tsx` — Wallpaper grid (predefined + custom image upload via `FileReader`).
- `appearance-section.tsx` — Color scheme pills (Light / Dark / Auto), accent color swatches, reduce transparency toggle.
- `dock-section.tsx` — Dock icon size segmented control (Small / Medium / Large), autohide toggle.
- `accessibility-section.tsx` — Reduce motion and reduce transparency toggles.
- `storage-section.tsx` — VFS node count, export VFS to JSON, clear all VFS data.
- `general-section.tsx` — Live runtime stats (processes, windows, FS nodes), reset settings to defaults.
