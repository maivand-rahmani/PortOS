# server

Server-only shared utilities for docs and easy-app API routes.

## Files

- `docs-data.ts`: reads repository docs and profile basics for the docs route.
- `ai-agent-context.ts`: builds compact AI-agent prompt context from docs, profile data, and runtime state.
- `mistral.ts`: creates the shared Mistral client, model selection, text extraction, and provider error mapping.
