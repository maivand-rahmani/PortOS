import type { AppConfig } from "@/entities/app";

import { aiAgentAppConfig } from "./ai-agent";
import { blogAppConfig } from "./blog";
import { calculatorAppConfig } from "./calculator";
import { clockAppConfig } from "./clock";
import { contactAppConfig } from "./contact";
import { docsAppConfig } from "./docs";
import { notesAppConfig } from "./notes";
import { portfolioAppConfig } from "./portfolio";
import { resumeAppConfig } from "./resume";
import { settingsAppConfig } from "./settings";
import { systemInfoAppConfig } from "./system-info";
import { terminalAppConfig } from "./terminal";

export const installedApps: AppConfig[] = [
  aiAgentAppConfig,
  terminalAppConfig,
  docsAppConfig,
  blogAppConfig,
  contactAppConfig,
  portfolioAppConfig,
  resumeAppConfig,
  systemInfoAppConfig,
  calculatorAppConfig,
  notesAppConfig,
  clockAppConfig,
  settingsAppConfig,
];

export { aiAgentAppConfig };
export { terminalAppConfig };
export { docsAppConfig };
export { blogAppConfig };
export { contactAppConfig };
export { portfolioAppConfig };
export { resumeAppConfig };
export { systemInfoAppConfig };
export { calculatorAppConfig };
export { notesAppConfig };
export { clockAppConfig };
export { settingsAppConfig };
