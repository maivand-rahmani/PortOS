# api

Route handlers for client-facing app data and server-side integrations.

## Folders

- `blog/`: serves local blog post data.
- `contact/`: validates contact form submissions.
- `docs/`: serves repository documentation content.
- `ai-agent/`: streams AI agent responses backed by server-loaded context.

This layer owns API routes only. Filesystem reads and provider clients should stay in server utilities when the logic grows.
