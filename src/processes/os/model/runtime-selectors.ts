import type { AppConfig, AppConfigMap } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { WindowInstance } from "@/entities/window";

type ActiveRuntimeTargetInput = {
  activeWindowId: string | null;
  appMap: AppConfigMap;
  processes: ProcessInstance[];
  windows: WindowInstance[];
  windowRecord?: Record<string, WindowInstance>;
  processRecord?: Record<string, ProcessInstance>;
};

export type ActiveRuntimeTarget = {
  activeApp: AppConfig | null;
  activeProcess: ProcessInstance | null;
  activeWindow: WindowInstance | null;
};

export function getWindowById(
  windows: WindowInstance[],
  windowId: string | null,
  windowRecord?: Record<string, WindowInstance>,
): WindowInstance | null {
  if (!windowId) {
    return null;
  }

  return windowRecord?.[windowId] ?? windows.find((window) => window.id === windowId) ?? null;
}

export function getProcessById(
  processes: ProcessInstance[],
  processId: string | null,
  processRecord?: Record<string, ProcessInstance>,
): ProcessInstance | null {
  if (!processId) {
    return null;
  }

  return processRecord?.[processId] ?? processes.find((process) => process.id === processId) ?? null;
}

export function getActiveRuntimeTarget({
  activeWindowId,
  appMap,
  processes,
  windows,
  windowRecord,
  processRecord,
}: ActiveRuntimeTargetInput): ActiveRuntimeTarget {
  const activeWindow = getWindowById(windows, activeWindowId, windowRecord);
  const activeProcess = getProcessById(processes, activeWindow?.processId ?? null, processRecord);
  const activeApp = activeWindow ? appMap[activeWindow.appId] ?? null : null;

  return {
    activeApp,
    activeProcess,
    activeWindow,
  };
}
