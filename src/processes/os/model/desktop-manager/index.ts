export {
  desktopManagerInitialState,
  DEFAULT_DESKTOP_SORT,
  DEFAULT_DESKTOP_VIEW_MODE,
} from "./desktop-manager.types";

export type {
  DesktopIconMap,
  DesktopManagerState,
  DesktopRenameState,
  SortConfig,
  SortKey,
  ViewMode,
} from "./desktop-manager.types";

export {
  snapToGrid,
  positionToCell,
  cellToPosition,
  computeGridLayout,
  getOccupiedCells,
  resolveCollision,
  sortItemsByCleanUpMode,
} from "./desktop-manager.grid";

export type {
  GridCellSize,
  GridSpacing,
  GridOrigin,
  GridCell,
  SortItemMeta,
} from "./desktop-manager.grid";
