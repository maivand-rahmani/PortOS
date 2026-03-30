# apps

Home for isolated application modules that the OS can load dynamically.

## Expected app structure

- `index.ts`: app metadata and exported `appConfig`, including optional declarative `statusBar` sections for shell actions.
- `ui/`: application-specific interface.
- `model/`: local app state and non-system logic.
- `assets/` or icon files: visual assets for the app.

## Current folders

- `ai-agent/`: developer agent that answers from docs/profile context and can open other PortOS apps.
- `terminal/`: command-line interface for app launching and basic shell commands.
- `docs/`: documentation reader for files in `docs/`.
- `blog/`: lightweight post reader backed by local post data.
- `contact/`: contact form and profile contact details.
- `portfolio/`: interactive project browser backed by profile and project docs.
- `resume/`: interactive resume built from local profile and project data.
- `system-info/`: live runtime metrics and process controls using real OS state.
- `calculator/`: expression-based calculator.
- `notes/`: local note-taking workspace.
- `clock/`: multi-timezone clock interface.
- `settings/`: system preferences and wallpaper controls.

Each app folder must include its own `README.md` that explains what the app does and what its internal folders contain.
