import type { AppStatusBarCommand } from "@/entities/app";
import type { DesktopBounds } from "@/entities/window";

import type {
  StatusBarCommandContext,
  StatusBarCommandRunner,
} from "./status-bar.types";

type StatusBarCommandRunnerDependencies = {
  bounds: DesktopBounds | null;
  launchApp: (appId: string, bounds?: DesktopBounds) => Promise<string | null>;
  activateApp: (appId: string, bounds?: DesktopBounds) => Promise<string | null>;
  openUrl: (href: string, target?: "_blank" | "_self") => void;
};

export function createStatusBarCommandRunner({
  bounds,
  launchApp,
  activateApp,
  openUrl,
}: StatusBarCommandRunnerDependencies): StatusBarCommandRunner {
  return async (
    command: AppStatusBarCommand,
    context?: StatusBarCommandContext,
  ) => {
    switch (command.type) {
      case "new-window": {
        const appId = context?.activeApp?.id;

        if (!appId || !bounds) {
          return;
        }

        await launchApp(appId, bounds);
        return;
      }
      case "open-app": {
        if (!bounds) {
          return;
        }

        await activateApp(command.appId, bounds);
        return;
      }
      case "open-url": {
        openUrl(command.href, command.target);
      }
    }
  };
}
