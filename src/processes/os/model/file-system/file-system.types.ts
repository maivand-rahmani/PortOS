import type {
  FileClipboard,
  FileSystemChildMap,
  FileSystemNode,
  FileSystemNodeMap,
  FileSearchResult,
} from "@/entities/file-system";

// ── Manager State ───────────────────────────────────────

export type FileSystemManagerState = {
  fsNodes: FileSystemNode[];
  fsNodeMap: FileSystemNodeMap;
  fsChildMap: FileSystemChildMap;
  fsHydrated: boolean;
  fsActiveFileId: string | null;
  fsClipboard: FileClipboard | null;
  fsSearchResults: FileSearchResult[];
  fsSearchQuery: string;
};

export const fileSystemManagerInitialState: FileSystemManagerState = {
  fsNodes: [],
  fsNodeMap: {},
  fsChildMap: {},
  fsHydrated: false,
  fsActiveFileId: null,
  fsClipboard: null,
  fsSearchResults: [],
  fsSearchQuery: "",
};

export function createFileSystemManagerModel(
  overrides: Partial<FileSystemManagerState> = {},
): FileSystemManagerState {
  return {
    ...fileSystemManagerInitialState,
    ...overrides,
  };
}
