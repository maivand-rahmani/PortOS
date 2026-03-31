import { getTopVisibleWindowId } from "../window-manager/window-manager.helpers";
import type { WindowManagerState } from "../window-manager";
import type { WorkspaceDefinition, WorkspaceId, WorkspaceManagerState } from "./workspace-manager.types";
import { DEFAULT_WORKSPACES } from "./workspace-manager.types";

export type { WorkspaceDefinition, WorkspaceId, WorkspaceManagerState } from "./workspace-manager.types";

export const workspaceManagerInitialState: WorkspaceManagerState = {
  currentWorkspaceId: DEFAULT_WORKSPACES[0].id,
  workspaces: DEFAULT_WORKSPACES,
};

export function switchWorkspaceModel(
  state: WorkspaceManagerState,
  workspaceId: WorkspaceId,
): WorkspaceManagerState {
  if (!state.workspaces.some((workspace) => workspace.id === workspaceId)) {
    return state;
  }

  return {
    ...state,
    currentWorkspaceId: workspaceId,
  };
}

export function cycleWorkspaceModel(
  state: WorkspaceManagerState,
  direction: 1 | -1,
): WorkspaceManagerState {
  const currentIndex = state.workspaces.findIndex(
    (workspace) => workspace.id === state.currentWorkspaceId,
  );

  if (currentIndex < 0) {
    return state;
  }

  const nextIndex =
    (currentIndex + direction + state.workspaces.length) % state.workspaces.length;

  return {
    ...state,
    currentWorkspaceId: state.workspaces[nextIndex].id,
  };
}

export function syncActiveWindowToWorkspace(
  state: WindowManagerState & Pick<WorkspaceManagerState, "currentWorkspaceId">,
): Pick<WindowManagerState, "activeWindowId"> {
  const visibleWindowId = getTopVisibleWindowId(
    state.windows.filter(
      (window) =>
        !window.isMinimized &&
        ("workspaceId" in window ? window.workspaceId === state.currentWorkspaceId : true),
    ),
  );

  return {
    activeWindowId: visibleWindowId,
  };
}
