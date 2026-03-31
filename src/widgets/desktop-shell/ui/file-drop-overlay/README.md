# file-drop-overlay

Shell-level overlay for real cross-app file drop zones.

## Files

- `file-drop-overlay.tsx` - highlights supported window targets while a file is being dragged from the Files app.

The shell decides when this overlay appears based on OS drag state. Apps stay responsible only for their own actual drop behavior.
