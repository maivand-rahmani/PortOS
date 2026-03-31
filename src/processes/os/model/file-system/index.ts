export {
  createFileSystemManagerModel,
  fileSystemManagerInitialState,
} from "./file-system.types";

export type { FileSystemManagerState } from "./file-system.types";

export {
  hydrateFileSystemModel,
  createFileModel,
  createDirectoryModel,
  deleteNodeModel,
  renameNodeModel,
  moveNodeModel,
  copyNodeModel,
  updateFileMetadataModel,
  setCutModel,
  setCopyModel,
  clearClipboardModel,
  getChildrenModel,
  getRootNodesModel,
  buildNodeMap,
  buildChildMap,
} from "./file-system.operations";

export {
  parsePath,
  normalizePath,
  joinPath,
  getNodePath,
  resolveNodeByPath,
  getAncestors,
  getDescendantIds,
  validateNodeName,
  isNameTakenInParent,
  resolveUniqueName,
} from "./file-system.path";

export {
  searchNodesModel,
  searchContentModel,
  setSearchQueryModel,
  setSearchResultsModel,
  clearSearchModel,
} from "./file-system.search";
