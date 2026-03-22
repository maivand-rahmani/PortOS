import { useOSStore } from "@/processes";

export async function openAppById(appId: string) {
  return useOSStore.getState().activateApp(appId);
}

export function closeWindowById(windowId: string) {
  useOSStore.getState().closeWindow(windowId);
}

export function minimizeWindowById(windowId: string) {
  useOSStore.getState().minimizeWindow(windowId);
}

export function terminateProcessById(processId: string) {
  useOSStore.getState().terminateProcess(processId);
}

export function getRuntimeSnapshot() {
  const state = useOSStore.getState();

  return {
    apps: state.apps,
    processes: state.processes,
    windows: state.windows,
    activeWindowId: state.activeWindowId,
    bootPhase: state.bootPhase,
    bootProgress: state.bootProgress,
  };
}
