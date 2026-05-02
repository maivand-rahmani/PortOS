"use client";

import { useCallback } from "react";
import { useOSStore } from "@/processes";

export function useDesktopSelection() {
  const desktopSelections = useOSStore((s) => s.desktopSelections);
  const desktopLastClicked = useOSStore((s) => s.desktopLastClicked);

  /**
   * Single click: replace entire selection with just this item.
   */
  const handleSelectSingle = useCallback((itemId: string) => {
    const store = useOSStore.getState();
    store.setDesktopLastClicked(itemId);
    store.setDesktopSelections([itemId]);
  }, []);

  /**
   * Cmd+click: toggle this item in/out of selection.
   */
  const handleToggleItem = useCallback((itemId: string) => {
    const store = useOSStore.getState();
    store.setDesktopLastClicked(itemId);
    store.toggleDesktopSelection(itemId);
  }, []);

  /**
   * Shift+click: select range from last-clicked to this item.
   */
  const handleRangeSelect = useCallback((itemId: string, allItemIds: string[]) => {
    const store = useOSStore.getState();
    const fromId = store.desktopLastClicked;
    if (fromId) {
      store.setRangeSelection(fromId, itemId, allItemIds);
    } else {
      store.setDesktopSelections([itemId]);
    }
    store.setDesktopLastClicked(itemId);
  }, []);

  /**
   * Clear all selections (e.g., click on empty desktop).
   */
  const handleClearSelection = useCallback(() => {
    useOSStore.getState().clearDesktopSelections();
  }, []);

  /**
   * Check if a specific item is selected.
   */
  const isSelected = useCallback((itemId: string): boolean => {
    return desktopSelections.includes(itemId);
  }, [desktopSelections]);

  /**
   * Unified click handler that respects modifier keys.
   */
  const handleItemClick = useCallback((
    itemId: string,
    event: React.MouseEvent | { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean },
    allItemIds: string[],
  ) => {
    if (event.metaKey || event.ctrlKey) {
      handleToggleItem(itemId);
    } else if (event.shiftKey) {
      handleRangeSelect(itemId, allItemIds);
    } else {
      handleSelectSingle(itemId);
    }
  }, [handleSelectSingle, handleToggleItem, handleRangeSelect]);

  return {
    desktopSelections,
    desktopLastClicked,
    isSelected,
    handleItemClick,
    handleClearSelection,
  };
}
