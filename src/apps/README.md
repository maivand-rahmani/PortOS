# apps

Home for isolated application modules that the OS can load dynamically.

## Expected app structure

- `index.js`: app metadata and exported `appConfig`.
- `ui/`: application-specific interface.
- `model/`: local app state and non-system logic.
- `assets/` or icon files: visual assets for the app.

Each app folder must include its own `README.md` that explains what the app does and what its internal folders contain.
