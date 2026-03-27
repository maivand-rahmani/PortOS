# model

Client-side logic for the AI agent app.

## Files

- `agent.ts`: session hook, streaming workflow, persistence, and OS action execution.
- `commandParser.ts`: natural-language app command detection and structured actions.
- `contextLoader.ts`: welcome content, runtime snapshots, and storage helpers.

This folder owns app behavior only. Server-side filesystem access stays in `src/shared/server/`.
