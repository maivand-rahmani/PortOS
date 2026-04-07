# AI Service (`/src/processes/os/model/ai-service/`)

System-level AI capability that provides context-aware actions to all apps.

## What this folder owns

The pure model layer for the AI service: types, action definitions, context builders, transcript persistence helpers, and the store-facing context contracts used by apps to publish window-specific AI context. No React, no Zustand — just pure functions and type definitions consumed by the store slice.

## Files

| File | Purpose |
|------|---------|
| `ai-service.types.ts` | All type definitions: actions, context, requests, results, transcripts, slice state |
| `ai-service.actions.ts` | Action registry plus pure capability/apply helpers for different contexts |
| `ai-service.context.ts` | Context injection helpers: content truncation, app-state payload building, request building, session IDs |
| `ai-service.transcripts.ts` | Transcript file persistence: create, append, serialize |
| `index.ts` | Barrel exports and initial state factory |

## Related

- **Store slice:** `src/processes/os/model/store/slices/ai-service.slice.ts`
- **API route:** `src/app/api/ai-service/route.ts`
- **Command palette UI:** `src/widgets/desktop-shell/ui/ai-command-palette/`
- **FS paths:** Transcripts stored at `/System/user/ai/transcripts/`
