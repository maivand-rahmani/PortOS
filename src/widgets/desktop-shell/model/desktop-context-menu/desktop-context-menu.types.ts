import type { AppConfig } from "@/entities/app";
import type { FileSystemNode } from "@/entities/file-system";
import type { WindowPosition } from "@/entities/window";

export type DesktopAppItem = {
  kind: "app";
  app: AppConfig;
  position: WindowPosition;
};

export type DesktopFsItem = {
  kind: "fs-item";
  node: FileSystemNode;
  position: WindowPosition;
};

export type DesktopItem = DesktopAppItem | DesktopFsItem;

export type ContextMenuTarget =
  | { kind: "desktop" }
  | { kind: "desktop-item"; desktopItem: DesktopItem };

export type ContextMenuActionItem = {
  kind: "action";
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  checked?: boolean;
};

export type ContextMenuSubmenuItem = {
  kind: "submenu";
  id: string;
  label: string;
  icon?: string;
  children: ContextMenuItem[];
};

export type ContextMenuSeparatorItem = {
  kind: "separator";
  key: string;
};

export type ContextMenuItem =
  | ContextMenuActionItem
  | ContextMenuSubmenuItem
  | ContextMenuSeparatorItem;

export type ContextMenuState = {
  isOpen: boolean;
  position: WindowPosition;
  target: ContextMenuTarget | null;
  items: ContextMenuItem[];
};

export type SortKey = "name" | "type" | "date";

export type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
};

export type ViewMode = "grid" | "compact";

export const ACTION_IDS = {
  NEW_FOLDER: "new-folder",
  NEW_FILE: "new-file",
  REFRESH_DESKTOP: "refresh-desktop",
  PASTE: "paste",
  SORT_BY_NAME: "sort-by-name",
  SORT_BY_TYPE: "sort-by-type",
  SORT_BY_DATE: "sort-by-date",
  VIEW_GRID: "view-grid",
  VIEW_COMPACT: "view-compact",

  CLEAN_UP: "clean-up",
  CLEAN_UP_BY_NAME: "clean-up-by-name",
  CLEAN_UP_BY_TYPE: "clean-up-by-type",
  CLEAN_UP_BY_DATE: "clean-up-by-date",

  OPEN: "open",
  RENAME: "rename",
  DUPLICATE: "duplicate",
  DELETE: "delete",
  MOVE_TO_TRASH: "move-to-trash",
  GET_INFO: "get-info",
  REVEAL_IN_FILES: "reveal-in-files",

  CHANGE_WALLPAPER: "change-wallpaper",
} as const;

export type ActionId = (typeof ACTION_IDS)[keyof typeof ACTION_IDS];
