export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  tags: string[];
};

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
};

export type TerminalResult = {
  output: string[];
  openAppId?: string;
};

export function calculateExpression(expression: string) {
  const safeExpression = expression.replace(/[^0-9+\-*/().%\s]/g, "");

  if (!safeExpression.trim()) {
    return "0";
  }

  const normalized = safeExpression.replace(/%/g, "/100");
  const result = Function(`"use strict"; return (${normalized});`)();

  if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error("Invalid calculation");
  }

  return Number.isInteger(result) ? String(result) : result.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

export function buildWorldClockTime(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  }).format(new Date());
}

export function createWeatherSnapshot(city: string) {
  const seed = city.toLowerCase().split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const temperature = 12 + (seed % 17);
  const wind = 3 + (seed % 8);
  const conditions = ["Clear", "Partly cloudy", "Rain drift", "Soft fog"];

  return {
    city,
    temperature,
    wind,
    condition: conditions[seed % conditions.length],
    updatedAt: new Date().toISOString(),
  };
}

export const blogPosts: BlogPost[] = [
  {
    id: "browser-os-interfaces",
    title: "Why portfolio interfaces should feel like products",
    excerpt: "A portfolio earns attention faster when it behaves like a system instead of a brochure.",
    body: "Interactive portfolio systems create better memory, stronger navigation, and more honest demonstrations of frontend ability.",
    publishedAt: "2026-03-20",
    tags: ["portfolio", "product", "frontend"],
  },
  {
    id: "window-systems-on-web",
    title: "Designing browser windows that feel intentional",
    excerpt: "Window interactions need tuned motion, not just drag handlers.",
    body: "A believable OS-like interface depends on focus, resize, depth, and state continuity more than chrome alone.",
    publishedAt: "2026-03-18",
    tags: ["ux", "windows", "motion"],
  },
];

export function validateContactSubmission(payload: ContactSubmission) {
  if (!payload.name.trim() || !payload.email.trim() || !payload.message.trim()) {
    throw new Error("All contact fields are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new Error("Enter a valid email address.");
  }

  if (payload.message.trim().length < 10) {
    throw new Error("Message must be at least 10 characters.");
  }

  return {
    ok: true,
    submittedAt: new Date().toISOString(),
  };
}

export function runTerminalCommand(input: string, availableApps: { id: string; name: string }[]) {
  const [command, ...args] = input.trim().split(/\s+/);

  if (!command) {
    return { output: [] } satisfies TerminalResult;
  }

  switch (command) {
    case "help":
      return {
        output: [
          "help, echo, date, fortune, cowsay, apps, open <app-id>",
        ],
      };
    case "echo":
      return { output: [args.join(" ")] };
    case "date":
      return { output: [new Date().toString()] };
    case "fortune": {
      const fortunes = [
        "Ship the real interaction, not the fake demo.",
        "A great UI earns trust through behavior.",
        "Delete the mock and keep the logic.",
      ];

      return { output: [fortunes[Math.floor(Math.random() * fortunes.length)]] };
    }
    case "cowsay": {
      const text = args.join(" ") || "PortOS says hi";

      return {
        output: [
          ` ${"_".repeat(text.length + 2)}`,
          `< ${text} >`,
          ` ${"-".repeat(text.length + 2)}`,
          "        \\   ^__^",
          "         \\  (oo)\\_______",
          "            (__)\\       )\\/\\",
          "                ||----w |",
          "                ||     ||",
        ],
      };
    }
    case "apps":
      return {
        output: availableApps.map((app) => `${app.id} :: ${app.name}`),
      };
    case "open": {
      const appId = args[0];
      const match = availableApps.find((app) => app.id === appId);

      if (!match) {
        return { output: [`Unknown app: ${appId ?? "(missing)"}`] };
      }

      return {
        output: [`Opening ${match.name}...`],
        openAppId: match.id,
      };
    }
    default:
      return { output: [`Command not found: ${command}`] };
  }
}
