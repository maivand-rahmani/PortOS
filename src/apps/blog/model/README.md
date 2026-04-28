# model

Blog reader state, filesystem persistence, and cross-app handoff builders.

## Files

- `blog-ai-context.ts`: builds the Blog window context published to the OS AI service.
- `blog-handoffs.ts`: builds Notes, AI agent, and Portfolio requests from the active post plus saved highlights.
- `blog-reader-storage.ts`: persists queue, completion state, and saved highlights in `/System/apps/blog/reader-state.json`.
