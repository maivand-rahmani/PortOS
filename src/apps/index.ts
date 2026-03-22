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
import { systemInfoAppConfig } from "./system-info";
import { terminalAppConfig } from "./terminal";
import { weatherAppConfig } from "./weather";

export const installedApps: AppConfig[] = [
  systemInfoAppConfig,
  terminalAppConfig,
  portfolioAppConfig,
  resumeAppConfig,
  docsAppConfig,
  blogAppConfig,
  contactAppConfig,
  aiAgentAppConfig,
  calculatorAppConfig,
  notesAppConfig,
  weatherAppConfig,
  clockAppConfig,
];

export { systemInfoAppConfig };
export { terminalAppConfig };
export { portfolioAppConfig };
export { resumeAppConfig };
export { docsAppConfig };
export { blogAppConfig };
export { contactAppConfig };
export { aiAgentAppConfig };
export { calculatorAppConfig };
export { notesAppConfig };
export { weatherAppConfig };
export { clockAppConfig };
