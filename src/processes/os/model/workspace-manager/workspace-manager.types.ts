export type { WorkspaceDefinition, WorkspaceId } from "@/entities/workspace";

import type { WorkspaceDefinition, WorkspaceId } from "@/entities/workspace";

export type WorkspaceManagerState = {
  currentWorkspaceId: WorkspaceId;
  workspaces: WorkspaceDefinition[];
};

export const DEFAULT_WORKSPACES: WorkspaceDefinition[] = [
  { id: "space-1", label: "Desktop 1", order: 1 },
  { id: "space-2", label: "Desktop 2", order: 2 },
  { id: "space-3", label: "Desktop 3", order: 3 },
];
