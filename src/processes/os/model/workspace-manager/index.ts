import { getTopVisibleWindowId } from "../window-manager/window-manager.helpers";
import type { WindowManagerState } from "../window-manager";
import type {
  WorkspaceDefinition,
  WorkspaceId,
  WorkspaceKind,
  WorkspaceSplitResizeState,
  WorkspaceSplitView,
  WorkspaceManagerState,
} from "./workspace-manager.types";
import { DEFAULT_WORKSPACES } from "./workspace-manager.types";

export type {
  WorkspaceDefinition,
  WorkspaceId,
  WorkspaceKind,
  WorkspaceSplitResizeState,
  WorkspaceSplitView,
  WorkspaceManagerState,
} from "./workspace-manager.types";

type EnterSplitViewInput = {
  workspaceId: WorkspaceId;
  leftWindowId: string;
  rightWindowId: string;
  ratio?: number;
};

type UpdateSplitViewInput = {
  workspaceId: WorkspaceId;
  splitView: WorkspaceSplitView | null;
};

type UpdateSplitRatioInput = {
  workspaceId: WorkspaceId;
  ratio: number;
};

type BeginSplitResizeInput = {
  workspaceId: WorkspaceId;
  originPointerX: number;
};

type UpdateSplitResizeInput = {
  pointerX: number;
};

function sortWorkspaces(workspaces: WorkspaceDefinition[]) {
  return [...workspaces].sort((left, right) => left.order - right.order);
}

function renumberWorkspaces(workspaces: WorkspaceDefinition[]) {
  return sortWorkspaces(workspaces).map((workspace, index) => ({
    ...workspace,
    order: index + 1,
  }));
}

export function getWorkspaceById(
  workspaces: WorkspaceDefinition[],
  workspaceId: WorkspaceId,
) {
  return workspaces.find((workspace) => workspace.id === workspaceId) ?? null;
}

export function getWorkspaceIndex(
  workspaces: WorkspaceDefinition[],
  workspaceId: WorkspaceId,
) {
  return sortWorkspaces(workspaces).findIndex((workspace) => workspace.id === workspaceId);
}

export function isFullscreenWorkspace(workspace: WorkspaceDefinition | null | undefined) {
  return workspace?.kind === "fullscreen";
}

export function isSplitWorkspace(workspace: WorkspaceDefinition | null | undefined) {
  return workspace?.kind === "fullscreen" && workspace.splitView != null;
}

export function getWorkspaceSplitView(
  workspaces: WorkspaceDefinition[],
  workspaceId: WorkspaceId,
) {
  return getWorkspaceById(workspaces, workspaceId)?.splitView ?? null;
}

function updateWorkspace(
  workspaces: WorkspaceDefinition[],
  workspaceId: WorkspaceId,
  updater: (workspace: WorkspaceDefinition) => WorkspaceDefinition,
) {
  return workspaces.map((workspace) =>
    workspace.id === workspaceId ? updater(workspace) : workspace,
  );
}

export function createFullscreenWorkspaceModel(
  state: WorkspaceManagerState,
  input: {
    ownerWindowId: string;
    label: string;
    afterWorkspaceId?: WorkspaceId;
  },
): { state: WorkspaceManagerState; workspace: WorkspaceDefinition } {
  const existing = state.workspaces.find(
    (workspace) => workspace.kind === "fullscreen" && workspace.ownerWindowId === input.ownerWindowId,
  );

  if (existing) {
  return {
    state: {
        ...state,
        currentWorkspaceId: existing.id,
      },
      workspace: existing,
    };
  }

  const ordered = sortWorkspaces(state.workspaces);
  const insertAfterIndex = input.afterWorkspaceId
    ? ordered.findIndex((workspace) => workspace.id === input.afterWorkspaceId)
    : ordered.findIndex((workspace) => workspace.id === state.currentWorkspaceId);
  const insertIndex = insertAfterIndex >= 0 ? insertAfterIndex + 1 : ordered.length;

  const workspace: WorkspaceDefinition = {
    id: crypto.randomUUID(),
    label: input.label,
    order: insertIndex + 1,
    kind: "fullscreen",
    ownerWindowId: input.ownerWindowId,
    splitView: null,
  };

  const nextWorkspaces = renumberWorkspaces([
    ...ordered.slice(0, insertIndex),
    workspace,
    ...ordered.slice(insertIndex),
  ]);

  return {
    state: {
      ...state,
      currentWorkspaceId: workspace.id,
      workspaces: nextWorkspaces,
    },
    workspace: nextWorkspaces.find((entry) => entry.id === workspace.id) ?? workspace,
  };
}

export function createDesktopWorkspaceModel(
  state: WorkspaceManagerState,
  input?: { afterWorkspaceId?: WorkspaceId },
): { state: WorkspaceManagerState; workspace: WorkspaceDefinition } {
  const ordered = sortWorkspaces(state.workspaces);
  const desktopCount = ordered.filter((w) => w.kind === "desktop").length;
  const insertAfterIndex = input?.afterWorkspaceId
    ? ordered.findIndex((workspace) => workspace.id === input.afterWorkspaceId)
    : ordered.findIndex((workspace) => workspace.id === state.currentWorkspaceId);
  const insertIndex = insertAfterIndex >= 0 ? insertAfterIndex + 1 : ordered.length;

  const workspace: WorkspaceDefinition = {
    id: crypto.randomUUID(),
    label: desktopCount > 0 ? `Desktop ${desktopCount + 1}` : "Desktop",
    order: insertIndex + 1,
    kind: "desktop",
    ownerWindowId: null,
    splitView: null,
  };

  const nextWorkspaces = renumberWorkspaces([
    ...ordered.slice(0, insertIndex),
    workspace,
    ...ordered.slice(insertIndex),
  ]);

  return {
    state: {
      ...state,
      currentWorkspaceId: workspace.id,
      workspaces: nextWorkspaces,
    },
    workspace: nextWorkspaces.find((entry) => entry.id === workspace.id) ?? workspace,
  };
}

export function removeWorkspaceModel(
  state: WorkspaceManagerState,
  workspaceId: WorkspaceId,
): WorkspaceManagerState {
  const targetWorkspace = getWorkspaceById(state.workspaces, workspaceId);

  if (!targetWorkspace || targetWorkspace.kind === "desktop") {
    return state;
  }

  const nextWorkspaces = renumberWorkspaces(
    state.workspaces.filter((workspace) => workspace.id !== workspaceId),
  );
  const fallbackWorkspace = nextWorkspaces.find((workspace) => workspace.kind === "desktop") ?? nextWorkspaces[0] ?? DEFAULT_WORKSPACES[0];

  return {
    currentWorkspaceId:
      state.currentWorkspaceId === workspaceId ? fallbackWorkspace.id : state.currentWorkspaceId,
    workspaces: nextWorkspaces,
    splitResizeState:
      state.splitResizeState?.workspaceId === workspaceId ? null : state.splitResizeState,
  };
}

export const workspaceManagerInitialState: WorkspaceManagerState = {
  currentWorkspaceId: DEFAULT_WORKSPACES[0].id,
  workspaces: DEFAULT_WORKSPACES,
  splitResizeState: null,
};

export function switchWorkspaceModel(
  state: WorkspaceManagerState,
  workspaceId: WorkspaceId,
): WorkspaceManagerState {
  if (!getWorkspaceById(state.workspaces, workspaceId)) {
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
  const ordered = sortWorkspaces(state.workspaces);
  const currentIndex = ordered.findIndex((workspace) => workspace.id === state.currentWorkspaceId);

  if (currentIndex < 0) {
    return state;
  }

  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= ordered.length) {
    return state;
  }

  return {
    ...state,
    currentWorkspaceId: ordered[nextIndex].id,
  };
}

export function enterSplitViewModel(
  state: WorkspaceManagerState,
  input: EnterSplitViewInput,
): WorkspaceManagerState {
  const workspace = getWorkspaceById(state.workspaces, input.workspaceId);

  if (!workspace || workspace.kind !== "fullscreen") {
    return state;
  }

  return {
    ...state,
    workspaces: updateWorkspace(state.workspaces, input.workspaceId, (entry) => ({
      ...entry,
      ownerWindowId: input.leftWindowId,
      splitView: {
        leftWindowId: input.leftWindowId,
        rightWindowId: input.rightWindowId,
        ratio: input.ratio ?? 0.5,
      },
    })),
  };
}

export function updateWorkspaceSplitViewModel(
  state: WorkspaceManagerState,
  input: UpdateSplitViewInput,
): WorkspaceManagerState {
  const workspace = getWorkspaceById(state.workspaces, input.workspaceId);

  if (!workspace || workspace.kind !== "fullscreen") {
    return state;
  }

  return {
    ...state,
    workspaces: updateWorkspace(state.workspaces, input.workspaceId, (entry) => ({
      ...entry,
      splitView: input.splitView,
      ownerWindowId: input.splitView?.leftWindowId ?? entry.ownerWindowId,
    })),
    splitResizeState:
      input.splitView === null && state.splitResizeState?.workspaceId === input.workspaceId
        ? null
        : state.splitResizeState,
  };
}

export function setSplitViewRatioModel(
  state: WorkspaceManagerState,
  input: UpdateSplitRatioInput,
): WorkspaceManagerState {
  const workspace = getWorkspaceById(state.workspaces, input.workspaceId);

  if (!workspace?.splitView) {
    return state;
  }

  return {
    ...state,
    workspaces: updateWorkspace(state.workspaces, input.workspaceId, (entry) => ({
      ...entry,
      splitView: entry.splitView
        ? {
            ...entry.splitView,
            ratio: input.ratio,
          }
        : null,
    })),
  };
}

export function beginSplitViewResizeModel(
  state: WorkspaceManagerState,
  input: BeginSplitResizeInput,
): WorkspaceManagerState {
  const splitView = getWorkspaceSplitView(state.workspaces, input.workspaceId);

  if (!splitView) {
    return state;
  }

  return {
    ...state,
    splitResizeState: {
      workspaceId: input.workspaceId,
      originPointerX: input.originPointerX,
      originRatio: splitView.ratio,
    },
  };
}

export function updateSplitViewResizeModel(
  state: WorkspaceManagerState,
  input: UpdateSplitResizeInput,
) {
  if (!state.splitResizeState) {
    return state;
  }

  return {
    ...state,
    splitResizeState: {
      ...state.splitResizeState,
      originPointerX: input.pointerX,
    },
  };
}

export function endSplitViewResizeModel(state: WorkspaceManagerState): WorkspaceManagerState {
  if (!state.splitResizeState) {
    return state;
  }

  return {
    ...state,
    splitResizeState: null,
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
