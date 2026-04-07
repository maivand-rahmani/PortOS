import type { AiServiceContext } from "@/processes";
import type { FileSystemNode } from "@/entities/file-system";

export function buildFilesAiContext(input: {
  windowId: string;
  currentPath: string;
  selectedNodes: FileSystemNode[];
  previewNode: FileSystemNode | null;
  previewContent: string | null;
  selectedFileContent: string | null;
  filePath: string | null;
}): AiServiceContext {
  const primaryNode = input.previewNode ?? input.selectedNodes[0] ?? null;
  const file = primaryNode?.type === "file"
    ? {
        nodeId: primaryNode.id,
        path: input.filePath ?? input.currentPath,
        name: primaryNode.name,
        mimeType: primaryNode.mimeType,
        content: input.previewNode ? input.previewContent ?? "" : input.selectedFileContent ?? "",
      }
    : undefined;

  return {
    sourceAppId: "files",
    sourceWindowId: input.windowId,
    file,
    appState: {
      currentPath: input.currentPath,
      selectedCount: input.selectedNodes.length,
      selectedNames: input.selectedNodes.map((node) => node.name),
      previewNodeName: input.previewNode?.name ?? null,
    },
  };
}
