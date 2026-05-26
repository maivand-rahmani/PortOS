# ai-service api

Server route for shared PortOS AI actions.

## Files

- `route.ts`: streams Mistral responses for summarize/explain/generate/modify/refactor/organize actions.

This route keeps the Mistral key on the server and exposes a stable local `/api/ai-service` contract to the client apps.
