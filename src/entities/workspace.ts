export type WorkspaceId = "space-1" | "space-2" | "space-3";

export type WorkspaceDefinition = {
  id: WorkspaceId;
  label: string;
  order: number;
};
