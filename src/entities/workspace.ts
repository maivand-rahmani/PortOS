export type WorkspaceId = string;

export type WorkspaceKind = "desktop" | "fullscreen";

export type WorkspaceSplitView = {
  leftWindowId: string;
  rightWindowId: string;
  ratio: number;
};

export type WorkspaceDefinition = {
  id: WorkspaceId;
  label: string;
  order: number;
  kind: WorkspaceKind;
  ownerWindowId: string | null;
  splitView: WorkspaceSplitView | null;
};
