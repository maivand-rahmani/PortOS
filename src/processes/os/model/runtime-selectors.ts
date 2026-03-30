import type { AppConfig, AppConfigMap } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { WindowInstance } from "@/entities/window";

type ActiveRuntimeTargetInput = {
  activeWindowId: string | null;
  appMap: AppConfigMap;
  processes: ProcessInstance[];
  windows: WindowInstance[];
};

export type ActiveRuntimeTarget = {
  activeApp: AppConfig | null;
  activeProcess: ProcessInstance | null;
  activeWindow: WindowInstance | null;
};

export function getWindowById(
  windows: WindowInstance[],
  windowId: string | null,
): WindowInstance | null {
  if (!windowId) {
    return null;
  }

  return windows.find((window) => window.id === windowId) ?? null;
}

export function getProcessById(
  processes: ProcessInstance[],
  processId: string | null,
): ProcessInstance | null {
  if (!processId) {
    return null;
  }

  return processes.find((process) => process.id === processId) ?? null;
}

export function getActiveRuntimeTarget({
  activeWindowId,
  appMap,
  processes,
  windows,
}: ActiveRuntimeTargetInput): ActiveRuntimeTarget {
  const activeWindow = getWindowById(windows, activeWindowId);
  const activeProcess = getProcessById(processes, activeWindow?.processId ?? null);
  const activeApp = activeWindow ? appMap[activeWindow.appId] ?? null : null;

  return {
    activeApp,
    activeProcess,
    activeWindow,
  };
}
