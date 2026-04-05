import type { AbsolutePath, FileSystemNodeType } from "@/entities/file-system";

export const FILE_SYSTEM_CHANGE_EVENT = "portos:file-system-change";

export type FileSystemChangeType =
  | "directory-created"
  | "file-created"
  | "file-written"
  | "node-deleted"
  | "node-moved"
  | "node-renamed";

export type FileSystemChangeDetail = {
  type: FileSystemChangeType;
  nodeId: string;
  nodeType: FileSystemNodeType;
  path?: AbsolutePath;
  previousPath?: AbsolutePath;
};

export function dispatchFileSystemChange(detail: FileSystemChangeDetail): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<FileSystemChangeDetail>(FILE_SYSTEM_CHANGE_EVENT, {
      detail,
    }),
  );
}

export function subscribeToFileSystemChanges(
  listener: (detail: FileSystemChangeDetail) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleEvent = (event: Event) => {
    listener((event as CustomEvent<FileSystemChangeDetail>).detail);
  };

  window.addEventListener(FILE_SYSTEM_CHANGE_EVENT, handleEvent);

  return () => {
    window.removeEventListener(FILE_SYSTEM_CHANGE_EVENT, handleEvent);
  };
}

export function isFileSystemChangeForPath(
  detail: FileSystemChangeDetail,
  path: AbsolutePath,
): boolean {
  return detail.path === path || detail.previousPath === path;
}

export function isFileSystemChangeWithinPath(
  detail: FileSystemChangeDetail,
  path: AbsolutePath,
): boolean {
  return (
    detail.path === path ||
    detail.previousPath === path ||
    detail.path?.startsWith(`${path}/`) === true ||
    detail.previousPath?.startsWith(`${path}/`) === true
  );
}
