# model

System Info runtime shaping, typed diagnostics, and operator actions.

## Files

- `content.ts`: derives meters, diagnostics, charts, and runtime rows from the OS store.
- `system-info-actions.ts`: bridges selected runtime targets into Notes, Terminal, focus, and termination flows.
- `system-info-ai-context.ts`: builds the System Info window context published to the OS AI service.
- `types.ts`: typed contracts for dashboard content, diagnostics, and selected targets.
- `use-system-info-controller.ts`: coordinates selection state, store reads, and external request handling for the app.
