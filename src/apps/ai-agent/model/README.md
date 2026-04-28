# model

Client-side logic for the AI agent app.

## Files

- `agent.ts`: session hook, streaming workflow, filesystem-backed history persistence, and OS action execution.
- `ai-agent-ai-context.ts`: builds the AI Agent window context published to the OS AI service.
- `commandParser.ts`: natural-language app command detection and structured actions.
- `contextLoader.ts`: welcome content, runtime snapshots, and `/System/apps/ai-agent/history.json` helpers.
- `external.ts`: thin app-local wrapper around the shared agent handoff API so other apps can open or prefill the agent without importing app internals.

This folder owns app behavior only. Server-side filesystem access stays in `src/shared/server/`.
