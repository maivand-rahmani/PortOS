# apps

Home for isolated application modules that the OS can load dynamically.

## Expected app structure

- `index.ts`: app metadata and exported `appConfig`.
- `ui/`: application-specific interface.
- `model/`: local app state and non-system logic.
- `assets/` or icon files: visual assets for the app.

## Current folders

- `system-overview/`: demo application used to verify the step-3 runtime.
- `notebook/`: paper-and-editorial notes workspace.
- `pixel-garden/`: retro pixel dashboard.
- `signal-terminal/`: terminal-style activity console.
- `weather-orbit/`: spatial weather panel.
- `soft-calc/`: neumorphic calculator.
- `frame-gallery/`: editorial image gallery.
- `beat-lab/`: retro-futurist music console.
- `mono-mail/`: monochrome inbox.
- `task-block/`: brutalist task board.

Each app folder must include its own `README.md` that explains what the app does and what its internal folders contain.
