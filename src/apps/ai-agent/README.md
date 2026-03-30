# ai-agent

Portfolio OS developer agent app that answers as Maivand, acts as a hiring/client attraction surface, reads project context through a server route, accepts live app-to-agent handoffs, and opens or guides other apps through the runtime.

## Folders and files

- `index.ts`: app metadata and lazy loader.
- `icon.tsx`: dock and desktop icon component.
- `theme.css`: minimal assistant-app gradients, shimmer states, and shared visuals.
- `model/`: command parsing, local session state, runtime/context helpers, and external handoff helpers.
- `ui/`: chat window, message bubble, launchpad, handoff banner, and input components.
- `assets/`: raw SVG source for the app icon.

The app keeps LLM access on the server, stores chat history locally, supports guided recruiter/client journeys, can create note drafts, uses existing OS actions instead of controlling window-manager internals directly, and exposes a callable handoff API for the shell or other apps.

## External handoff API

Other PortOS surfaces can open or prefill the agent through `src/apps/ai-agent/model/external.ts`.

```ts
import { openAgentWithRequest } from "@/apps/ai-agent/model/external";

await openAgentWithRequest({
  prompt: "Summarize this app for a recruiter.",
  title: "Recruiter brief",
  source: {
    appId: "portfolio",
    label: "Portfolio",
  },
  suggestions: ["Open resume", "What proves system design skill?"],
});
```

Use `mode: "prefill"` to stage the prompt in the composer without auto-sending it.
