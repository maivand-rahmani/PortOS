import { useOSStore } from "@/processes";
import { dispatchAgentNotesPrefill, type AgentNotesPrefillDetail } from "./agent-os-events";
import { dispatchClockFocusRequest, type ClockFocusRequest } from "./clock-os-events";
import { dispatchNotesExternalRequest, type NotesExternalRequestDetail } from "./notes-os-events";
import { dispatchTerminalExternalRequest, type TerminalExternalRequestDetail } from "./terminal-os-events";

export async function openAppById(appId: string) {
  return useOSStore.getState().activateApp(appId);
}

export async function focusOrOpenAppById(appId: string) {
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

export function focusWindowById(windowId: string) {
  useOSStore.getState().focusWindow(windowId);
}

export function restoreWindowById(windowId: string) {
  useOSStore.getState().restoreWindow(windowId);
}

export function maximizeWindowById(windowId: string) {
  const state = useOSStore.getState();
  const bounds = {
    width: window.innerWidth,
    height: window.innerHeight,
    insetTop: 32,
    insetRight: 24,
    insetBottom: 132,
    insetLeft: 24,
  };

  state.toggleWindowMaximize(windowId, bounds);
}

export async function openNotesWithPrefill(detail: AgentNotesPrefillDetail) {
  dispatchAgentNotesPrefill(detail);
  return useOSStore.getState().activateApp("notes");
}

export async function openClockWithFocus(detail: ClockFocusRequest) {
  const windowId = await useOSStore.getState().activateApp("clock");

  if (windowId) {
    dispatchClockFocusRequest({
      ...detail,
      targetWindowId: windowId,
    });
  }

  return windowId;
}

export async function openNotesWithRequest(detail: NotesExternalRequestDetail) {
  const windowId = await useOSStore.getState().activateApp("notes");

  if (windowId) {
    dispatchNotesExternalRequest({
      ...detail,
      targetWindowId: windowId,
    });
  }

  return windowId;
}

export async function openTerminalWithRequest(detail: TerminalExternalRequestDetail) {
  const windowId = await useOSStore.getState().activateApp("terminal");

  if (windowId) {
    dispatchTerminalExternalRequest({
      ...detail,
      targetWindowId: windowId,
    });
  }

  return windowId;
}

export async function openTerminalWithCommand(command: string, options?: Omit<TerminalExternalRequestDetail, "command">) {
  return openTerminalWithRequest({
    command,
    execute: options?.execute,
    source: options?.source,
  });
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
