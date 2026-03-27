export type AppCommandAction = {
  type: "OPEN_APP" | "OPEN_TOUR" | "OPEN_CONTACT_FLOW" | "OPEN_NOTES_DRAFT";
  payload: {
    appId?: string;
    label: string;
    prompt?: string;
    noteTitle?: string;
    noteBody?: string;
    noteTags?: string[];
  };
};

export type ParsedCommand = {
  action: AppCommandAction | null;
  requestedLabel: string | null;
  missingTarget: string | null;
};

type AvailableApp = {
  id: string;
  name: string;
};

const APP_ALIASES: Record<string, string> = {
  terminal: "terminal",
  console: "terminal",
  shell: "terminal",
  docs: "docs",
  documentation: "docs",
  blog: "blog",
  contact: "contact",
  portfolio: "portfolio",
  projects: "portfolio",
  resume: "resume",
  cv: "resume",
  calculator: "calculator",
  calc: "calculator",
  notes: "notes",
  note: "notes",
  clock: "clock",
  time: "clock",
  settings: "settings",
  preferences: "settings",
  "system info": "system-info",
  system: "system-info",
  "system-info": "system-info",
  maivand: "ai-agent",
  agent: "ai-agent",
  assistant: "ai-agent",
};

const OPEN_PATTERNS = [
  /\b(?:open|launch|start|run)\s+([a-z0-9\s-]+?)(?:[.!?,]|$)/i,
  /\bbring up\s+([a-z0-9\s-]+?)(?:[.!?,]|$)/i,
];

const TOUR_PATTERNS = [
  /\b(?:show|give|start)\s+(?:me\s+)?(?:a\s+)?(?:tour|walkthrough)\b/i,
  /\bguide\s+me\s+(?:through|around)\b/i,
  /\brun\s+(?:a\s+)?(?:live\s+)?(?:portfolio\s+)?walkthrough\b/i,
  /\b(?:live\s+)?portfolio\s+walkthrough\b/i,
  /\bportfolio\s+tour\b/i,
];

const CONTACT_PATTERNS = [
  /\b(?:how\s+can\s+i\s+contact\s+you|contact\s+you|hire\s+you|work\s+with\s+you)\b/i,
  /\b(?:freelance|full[- ]?time|available\s+for\s+work)\b/i,
];

const DRAFT_PATTERNS = [
  /\b(?:draft|write|create)\s+(?:a\s+)?(?:note|summary|brief)\b/i,
];

function normalizeTarget(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function isTourRequest(value: string) {
  return /\b(tour|walkthrough)\b/i.test(value) && /\b(portfolio|live|guided?)\b/i.test(value);
}

export function parseAgentCommand(input: string, apps: AvailableApp[]): ParsedCommand {
  if (TOUR_PATTERNS.some((pattern) => pattern.test(input))) {
    return {
      action: {
        type: "OPEN_TOUR",
        payload: {
          label: "Portfolio tour",
          prompt: "Run a live portfolio walkthrough. Open portfolio first, then resume, then docs, and explain clearly why each one matters for hiring or client trust.",
        },
      },
      requestedLabel: "tour",
      missingTarget: null,
    };
  }

  if (CONTACT_PATTERNS.some((pattern) => pattern.test(input))) {
    return {
      action: {
        type: "OPEN_CONTACT_FLOW",
        payload: {
          label: "Contact flow",
          prompt: "I want to hire you or contact you. Show me the fastest path and open the relevant apps.",
        },
      },
      requestedLabel: "contact",
      missingTarget: null,
    };
  }

  if (DRAFT_PATTERNS.some((pattern) => pattern.test(input))) {
    return {
      action: {
        type: "OPEN_NOTES_DRAFT",
        payload: {
          label: "New draft",
          noteTitle: "New agent draft",
          noteBody: "Captured from the AI agent.\n\n",
          noteTags: ["agent", "draft"],
        },
      },
      requestedLabel: "draft",
      missingTarget: null,
    };
  }

  const matchedPattern = OPEN_PATTERNS.find((pattern) => pattern.test(input));

  if (!matchedPattern) {
    return {
      action: null,
      requestedLabel: null,
      missingTarget: null,
    };
  }

  const rawMatch = input.match(matchedPattern)?.[1] ?? "";
  const normalizedTarget = normalizeTarget(rawMatch);

  if (isTourRequest(normalizedTarget)) {
    return {
      action: {
        type: "OPEN_TOUR",
        payload: {
          label: "Portfolio tour",
          prompt: "Run a live portfolio walkthrough. Open portfolio first, then resume, then docs, and explain clearly why each one matters for hiring or client trust.",
        },
      },
      requestedLabel: normalizedTarget,
      missingTarget: null,
    };
  }

  if (!normalizedTarget) {
    return {
      action: null,
      requestedLabel: null,
      missingTarget: null,
    };
  }

  const exactApp = apps.find((app) => {
    const appId = normalizeTarget(app.id);
    const appName = normalizeTarget(app.name);

    return normalizedTarget === appId || normalizedTarget === appName;
  });

  if (exactApp) {
    return {
      action: {
        type: "OPEN_APP",
        payload: {
          appId: exactApp.id,
          label: exactApp.name,
        },
      },
      requestedLabel: normalizedTarget,
      missingTarget: null,
    };
  }

  const aliasTarget = APP_ALIASES[normalizedTarget];
  const aliasApp = aliasTarget ? apps.find((app) => app.id === aliasTarget) : undefined;

  if (aliasApp) {
    return {
      action: {
        type: "OPEN_APP",
        payload: {
          appId: aliasApp.id,
          label: aliasApp.name,
        },
      },
      requestedLabel: normalizedTarget,
      missingTarget: null,
    };
  }

  return {
    action: null,
    requestedLabel: normalizedTarget,
    missingTarget: normalizedTarget,
  };
}

export function describeRequestedAction(parsed: ParsedCommand) {
  if (parsed.action?.type === "OPEN_APP") {
    return `OPEN_APP:${parsed.action.payload.appId}`;
  }

  if (parsed.action?.type === "OPEN_TOUR") {
    return "OPEN_TOUR";
  }

  if (parsed.action?.type === "OPEN_CONTACT_FLOW") {
    return "OPEN_CONTACT_FLOW";
  }

  if (parsed.action?.type === "OPEN_NOTES_DRAFT") {
    return "OPEN_NOTES_DRAFT";
  }

  if (parsed.missingTarget) {
    return `OPEN_APP_MISSING:${parsed.missingTarget}`;
  }

  return null;
}
