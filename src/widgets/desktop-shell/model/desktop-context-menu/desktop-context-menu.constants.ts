import type {
  ContextMenuItem,
  SortConfig,
  SortKey,
  ViewMode,
} from "./desktop-context-menu.types";

export function getDesktopMenuItems(
  canPaste: boolean,
  currentSort: SortConfig,
  currentViewMode: ViewMode,
): ContextMenuItem[] {
  return [
    {
      kind: "action",
      id: "new-folder",
      label: "New Folder",
      icon: "📁",
      shortcut: "⌘⇧N",
    },
    {
      kind: "action",
      id: "new-file",
      label: "New File",
      icon: "📄",
      shortcut: "⌘N",
    },
    { kind: "separator", key: "create-sep" },
    {
      kind: "action",
      id: "refresh-desktop",
      label: "Refresh Desktop",
      shortcut: "⌘R",
    },
    {
      kind: "action",
      id: "paste",
      label: "Paste",
      icon: "📋",
      shortcut: "⌘V",
      disabled: !canPaste,
    },
    { kind: "separator", key: "arrange-sep" },
    {
      kind: "submenu",
      id: "sort-by",
      label: "Sort By",
      icon: "↕️",
      children: [
        {
          kind: "action",
          id: "sort-by-name",
          label: "Name",
          checked: currentSort.key === "name",
        },
        {
          kind: "action",
          id: "sort-by-type",
          label: "Type",
          checked: currentSort.key === "type",
        },
        {
          kind: "action",
          id: "sort-by-date",
          label: "Date",
          checked: currentSort.key === "date",
        },
      ],
    },
    {
      kind: "submenu",
      id: "view-mode",
      label: "View",
      icon: "👁️",
      children: [
        {
          kind: "action",
          id: "view-grid",
          label: "Grid",
          checked: currentViewMode === "grid",
        },
        {
          kind: "action",
          id: "view-compact",
          label: "Compact",
          checked: currentViewMode === "compact",
        },
      ],
    },
    { kind: "separator", key: "cleanup-sep" },
    {
      kind: "action",
      id: "clean-up",
      label: "Clean Up",
    },
    {
      kind: "submenu",
      id: "clean-up-by",
      label: "Clean Up By",
      children: [
        {
          kind: "action",
          id: "clean-up-by-name",
          label: "Name",
          checked: currentSort.key === "name",
        },
        {
          kind: "action",
          id: "clean-up-by-type",
          label: "Kind",
          checked: currentSort.key === "type",
        },
        {
          kind: "action",
          id: "clean-up-by-date",
          label: "Date",
          checked: currentSort.key === "date",
        },
      ],
    },
    { kind: "separator", key: "change-desk-sep" },
    {
      kind: "action",
      id: "change-wallpaper",
      label: "Change Wallpaper…",
      icon: "🖼️",
    },
  ];
}

export function getFsItemMenuItems(
  selectedFsItemCount?: number,
): ContextMenuItem[] {
  const isMulti = selectedFsItemCount != null && selectedFsItemCount >= 3;

  return [
    {
      kind: "action",
      id: "open",
      label: "Open",
      icon: "↗️",
    },
    { kind: "separator", key: "open-sep" },
    {
      kind: "action",
      id: "rename",
      label: "Rename",
      icon: "✏️",
      shortcut: "⏎",
    },
    {
      kind: "action",
      id: "duplicate",
      label: isMulti ? `Duplicate ${selectedFsItemCount} Items` : "Duplicate",
      icon: "📋",
      shortcut: "⌘D",
    },
    { kind: "separator", key: "actions-sep" },
    {
      kind: "action",
      id: "get-info",
      label: "Get Info",
      icon: "ℹ️",
      shortcut: "⌘I",
    },
    { kind: "separator", key: "info-sep" },
    {
      kind: "action",
      id: "move-to-trash",
      label: isMulti ? `Move ${selectedFsItemCount} Items to Trash` : "Move to Trash",
      icon: "🗑️",
      destructive: true,
      shortcut: "⌘⌫",
    },
    { kind: "separator", key: "reveal-sep" },
    {
      kind: "action",
      id: "reveal-in-files",
      label: "Reveal in Files",
      icon: "🔍",
    },
  ];
}

export function getAppItemMenuItems(): ContextMenuItem[] {
  return [
    {
      kind: "action",
      id: "open",
      label: "Open",
      icon: "↗️",
    },
  ];
}

export function toggleSortDirection(
  current: SortConfig,
  newKey: SortKey,
): SortConfig {
  if (current.key === newKey) {
    return {
      key: newKey,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }
  return { key: newKey, direction: "asc" };
}

export const DEFAULT_SORT_CONFIG: SortConfig = {
  key: "name",
  direction: "asc",
};

export const DEFAULT_VIEW_MODE: ViewMode = "grid";
