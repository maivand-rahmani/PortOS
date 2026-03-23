# apps

Home for isolated application modules that the OS can load dynamically.

## Expected app structure

- `index.ts`: app metadata and exported `appConfig`.
- `ui/`: application-specific interface.
- `model/`: local app state and non-system logic.
- `assets/` or icon files: visual assets for the app.

## Current folders

- `terminal/`: command-line interface for app launching and basic shell commands.
- `docs/`: documentation reader for files in `docs/`.
- `blog/`: lightweight post reader backed by local post data.
- `contact/`: contact form and profile contact details.
- `calculator/`: expression-based calculator.
- `notes/`: local note-taking workspace.
- `clock/`: multi-timezone clock interface.

Each app folder must include its own `README.md` that explains what the app does and what its internal folders contain.
