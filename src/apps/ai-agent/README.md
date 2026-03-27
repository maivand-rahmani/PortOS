# ai-agent

Portfolio OS developer agent app that answers as Maivand, acts as a hiring/client attraction surface, reads project context through a server route, and opens or guides other apps through the runtime.

## Folders and files

- `index.ts`: app metadata and lazy loader.
- `icon.tsx`: dock and desktop icon component.
- `theme.css`: minimal assistant-app gradients, shimmer states, and shared visuals.
- `model/`: command parsing, local session state, and runtime/context helpers.
- `ui/`: chat window, message bubble, and input components.
- `assets/`: raw SVG source for the app icon.

The app keeps LLM access on the server, stores chat history locally, supports guided recruiter/client journeys, can create note drafts, and uses existing OS actions instead of controlling window-manager internals directly.
