# ai-agent api

Server route for the PortOS AI agent.

## Files

- `route.ts`: streams Mistral responses using project docs, profile data, and runtime context.

This route keeps the Mistral key on the server and prevents the client app from reading local files directly.
