export type {
  WorkspaceDefinition,
  WorkspaceId,
  WorkspaceKind,
  WorkspaceSplitView,
} from "@/entities/workspace";

import type { WorkspaceDefinition, WorkspaceId } from "@/entities/workspace";

export type WorkspaceSplitResizeState = {
  workspaceId: WorkspaceId;
  originPointerX: number;
  originRatio: number;
} | null;

export type WorkspaceManagerState = {
  currentWorkspaceId: WorkspaceId;
  workspaces: WorkspaceDefinition[];
  splitResizeState: WorkspaceSplitResizeState;
};

export const DEFAULT_WORKSPACES: WorkspaceDefinition[] = [
  {
    id: "space-1",
    label: "Desktop",
    order: 1,
    kind: "desktop",
    ownerWindowId: null,
    splitView: null,
  },
];
