import type { AppConfig } from "@/entities/app";

import { blogAppConfig } from "./blog";
import { calculatorAppConfig } from "./calculator";
import { clockAppConfig } from "./clock";
import { contactAppConfig } from "./contact";
import { docsAppConfig } from "./docs";
import { notesAppConfig } from "./notes";
import { settingsAppConfig } from "./settings";
import { terminalAppConfig } from "./terminal";

export const installedApps: AppConfig[] = [
  terminalAppConfig,
  docsAppConfig,
  blogAppConfig,
  contactAppConfig,
  calculatorAppConfig,
  notesAppConfig,
  clockAppConfig,
  settingsAppConfig,
];

export { terminalAppConfig };
export { docsAppConfig };
export { blogAppConfig };
export { contactAppConfig };
export { calculatorAppConfig };
export { notesAppConfig };
export { clockAppConfig };
export { settingsAppConfig };
