"use client";

import { useEffect, useRef } from "react";

import type { DesktopBounds, WindowPosition } from "@/entities/window";
import type { WindowSnapZone } from "@/processes";

import {
  DESKTOP_AI_WIDGET,
  DESKTOP_INSETS,
  getDesktopIconConfig,
} from "./desktop-shell.constants";
import type { DesktopIconDragState, DesktopWidgetDragState } from "./desktop-shell.types";
import type { DesktopItem } from "./desktop-context-menu/desktop-context-menu.types";
import type { WorkspaceSplitResizeState } from "@/processes/os/model/workspace-manager/workspace-manager.types";
import {
  snapToRightAlignedGrid,
  positionToCellRightAligned,
  cellToPositionRightAligned,
  resolveCollisionRightAligned,
  getOccupiedCellsRightAligned,
} from "./desktop-shell.layout";
import { useOSStore } from "@/processes";

export function useDesktopPointerEvents(params: {
  desktopBounds: DesktopBounds | null;
  desktopIconDragState: DesktopIconDragState;
  desktopWidgetDragState: DesktopWidgetDragState;
  splitResizeState: WorkspaceSplitResizeState | null;
  updateFileDrag: (pointer: WindowPosition) => void;
  updateSplitResize: (pointerX: number, bounds: DesktopBounds) => void;
  updateWindowDrag: (pointer: WindowPosition, bounds: DesktopBounds) => void;
  updateWindowResize: (pointer: WindowPosition, bounds: DesktopBounds) => void;
  endWindowDrag: () => void;
  endFileDrag: () => void;
  endSplitResize: () => void;
  endWindowResize: () => void;
  snapWindowToZone: (windowId: string, zone: WindowSnapZone, bounds: DesktopBounds) => void;
  getContainerPointer: (pointer: WindowPosition) => WindowPosition;
  setAiWidgetPosition: (position: WindowPosition) => void;
  setDesktopIconDragState: (state: DesktopIconDragState) => void;
  setDesktopWidgetDragState: (state: DesktopWidgetDragState) => void;
  updateMarquee: (pointer: WindowPosition) => void;
  endMarquee: (desktopItems: DesktopItem[], onSelect: (ids: string[], isAdditive: boolean) => void) => void;
  desktopItems: DesktopItem[];
  handleMarqueeEnd: (ids: string[], isAdditive: boolean) => void;
  setIconDropTargetFolderId: (id: string | null) => void;
}): void {
  const {
    desktopBounds,
    desktopIconDragState,
    desktopWidgetDragState,
    splitResizeState,
    updateFileDrag,
    updateSplitResize,
    updateWindowDrag,
    updateWindowResize,
    endWindowDrag,
    endFileDrag,
    endSplitResize,
    endWindowResize,
    snapWindowToZone,
    getContainerPointer,
    setAiWidgetPosition,
    setDesktopIconDragState,
    setDesktopWidgetDragState,
    updateMarquee,
    endMarquee,
    desktopItems,
    handleMarqueeEnd,
    setIconDropTargetFolderId,
  } = params;

  const dragRafRef = useRef<number | null>(null);
  const pendingPointerEventRef = useRef<PointerEvent | null>(null);
  const dropTargetFolderRef = useRef<string | null>(null);

  useEffect(() => {
    if (!desktopBounds) {
      return undefined;
    }

    const processPointerEvent = (event: PointerEvent) => {
      const nextPointer = getContainerPointer({
        x: event.clientX,
        y: event.clientY,
      });

      if (desktopIconDragState) {
        const rawX = nextPointer.x - desktopIconDragState.offset.x;
        const rawY = nextPointer.y - desktopIconDragState.offset.y;
        const maxX = Math.max(
          desktopBounds.insetLeft,
          desktopBounds.width - desktopBounds.insetRight - 88,
        );
        const maxY = Math.max(
          desktopBounds.insetTop,
          desktopBounds.height - desktopBounds.insetBottom - 96,
        );

        const store = useOSStore.getState();
        const current = store.desktopIconPositions;
        const { initialPositions } = desktopIconDragState;

        if (initialPositions && Object.keys(initialPositions).length > 1) {
          const initPos = initialPositions[desktopIconDragState.appId];
          if (initPos) {
            const deltaX = rawX - initPos.x;
            const deltaY = rawY - initPos.y;

            const newMap: Record<string, WindowPosition> = { ...current };
            for (const key of Object.keys(initialPositions)) {
              const itemInit = initialPositions[key];
              if (!itemInit) continue;
              newMap[key] = {
                x: Math.min(Math.max(itemInit.x + deltaX, desktopBounds.insetLeft), maxX),
                y: Math.min(Math.max(itemInit.y + deltaY, desktopBounds.insetTop), maxY),
              };
            }
            store.setDesktopIconPositions(newMap);
          }
        } else {
          const clampedX = Math.min(Math.max(rawX, desktopBounds.insetLeft), maxX);
          const clampedY = Math.min(Math.max(rawY, desktopBounds.insetTop), maxY);

          store.setDesktopIconPositions({
            ...current,
            [desktopIconDragState.appId]: { x: clampedX, y: clampedY },
          });
        }

        // Hit-test: check if pointer is over a desktop folder
        const viewMode = store.desktopViewMode ?? "grid";
        const iconConfig = getDesktopIconConfig(viewMode);
        let foundFolderId: string | null = null;

        for (const item of desktopItems) {
          if (item.kind !== "fs-item") continue;
          if (item.node.type !== "directory") continue;

          const rect = {
            left: item.position.x,
            top: item.position.y,
            right: item.position.x + iconConfig.frame.width,
            bottom: item.position.y + iconConfig.frame.height,
          };

          if (
            nextPointer.x >= rect.left &&
            nextPointer.x <= rect.right &&
            nextPointer.y >= rect.top &&
            nextPointer.y <= rect.bottom
          ) {
            foundFolderId = item.node.id;
            break;
          }
        }

        dropTargetFolderRef.current = foundFolderId;
        setIconDropTargetFolderId(foundFolderId);
      }

      if (desktopWidgetDragState) {
        const maxX = Math.max(
          desktopBounds.insetLeft,
          desktopBounds.width - desktopBounds.insetRight - DESKTOP_AI_WIDGET.width,
        );
        const maxY = Math.max(
          desktopBounds.insetTop,
          desktopBounds.height - desktopBounds.insetBottom - DESKTOP_AI_WIDGET.height,
        );

        setAiWidgetPosition({
          x: Math.min(
            Math.max(nextPointer.x - desktopWidgetDragState.offset.x, desktopBounds.insetLeft),
            maxX,
          ),
          y: Math.min(
            Math.max(nextPointer.y - desktopWidgetDragState.offset.y, desktopBounds.insetTop),
            maxY,
          ),
        });
      }

      updateFileDrag(nextPointer);
      if (splitResizeState) {
        updateSplitResize(nextPointer.x, desktopBounds);
      }
      updateWindowDrag(nextPointer, desktopBounds);
      updateWindowResize(nextPointer, desktopBounds);
      updateMarquee(nextPointer);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pendingPointerEventRef.current = event;

      if (dragRafRef.current === null) {
        dragRafRef.current = requestAnimationFrame(() => {
          dragRafRef.current = null;
          const latest = pendingPointerEventRef.current;

          if (latest) {
            pendingPointerEventRef.current = null;
            processPointerEvent(latest);
          }
        });
      }
    };

    const handlePointerUp = () => {
      const store = useOSStore.getState();

      if (store.dragState && store.windowSnapZone && desktopBounds) {
        const snapWindowId = store.dragState.windowId;
        const zone = store.windowSnapZone;

        endWindowDrag();
        snapWindowToZone(snapWindowId, zone, desktopBounds);
      } else {
        endWindowDrag();
      }

      if (desktopIconDragState && desktopBounds) {
        const mode = store.desktopViewMode;
        const iconConfig = getDesktopIconConfig(mode);
        const gridOriginY = DESKTOP_INSETS.top + 20;

        const usableHeight =
          desktopBounds.height - DESKTOP_INSETS.bottom - gridOriginY;
        const usableWidth =
          desktopBounds.width - DESKTOP_INSETS.left - DESKTOP_INSETS.right;
        const maxRows =
          Math.max(1, Math.floor(usableHeight / iconConfig.spacing.y) + 1);
        const maxCols =
          Math.max(1, Math.floor(usableWidth / iconConfig.spacing.x) + 1);

        const currentPositions = store.desktopIconPositions;
        const draggedAppId = desktopIconDragState.appId;
        const draggedFinalPos = currentPositions[draggedAppId];

        if (draggedFinalPos) {
          const otherPositions: Record<string, WindowPosition> = {};
          for (const key of Object.keys(currentPositions)) {
            if (key !== draggedAppId) {
              otherPositions[key] = currentPositions[key];
            }
          }

          const snappedPos = snapToRightAlignedGrid(
            draggedFinalPos,
            desktopBounds,
            iconConfig.frame,
            iconConfig.spacing,
          );
          let occupiedCells = getOccupiedCellsRightAligned(
            otherPositions,
            desktopBounds,
            iconConfig.frame,
            iconConfig.spacing,
          );
          const desiredCell = positionToCellRightAligned(
            snappedPos,
            desktopBounds,
            iconConfig.frame,
            iconConfig.spacing,
          );
          const freeCell = resolveCollisionRightAligned(
            desiredCell,
            occupiedCells,
            maxRows,
            maxCols,
          );
          const finalPos = cellToPositionRightAligned(
            freeCell,
            desktopBounds,
            iconConfig.frame,
            iconConfig.spacing,
          );

          const delta = {
            x: finalPos.x - draggedFinalPos.x,
            y: finalPos.y - draggedFinalPos.y,
          };

          const newPositions: Record<string, WindowPosition> = {
            ...currentPositions,
            [draggedAppId]: finalPos,
          };

          occupiedCells = getOccupiedCellsRightAligned(
            newPositions,
            desktopBounds,
            iconConfig.frame,
            iconConfig.spacing,
          );

          const selections = store.desktopSelections;
          if (selections.length > 1) {
            for (const itemId of selections) {
              const storeKey = itemId.startsWith("app:")
                ? itemId.slice(4)
                : itemId.startsWith("fs:")
                  ? itemId.slice(3)
                  : itemId;

              if (storeKey === draggedAppId) continue;

              const otherPos = currentPositions[storeKey];
              if (!otherPos) continue;

              const shiftedPos = {
                x: otherPos.x + delta.x,
                y: otherPos.y + delta.y,
              };
              const snapped = snapToRightAlignedGrid(
                shiftedPos,
                desktopBounds,
                iconConfig.frame,
                iconConfig.spacing,
              );
              const cell = positionToCellRightAligned(
                snapped,
                desktopBounds,
                iconConfig.frame,
                iconConfig.spacing,
              );
              const resolved = resolveCollisionRightAligned(
                cell,
                occupiedCells,
                maxRows,
                maxCols,
              );
              const resolvedPos = cellToPositionRightAligned(
                resolved,
                desktopBounds,
                iconConfig.frame,
                iconConfig.spacing,
              );

              newPositions[storeKey] = resolvedPos;
              occupiedCells.add(`${resolved.row},${resolved.col}`);
            }
          }

          store.setDesktopIconPositions(newPositions);
        }
      }

      // Drop onto folder: move selected FS items into the target directory
      const targetFolderId = dropTargetFolderRef.current;

      if (targetFolderId) {
        dropTargetFolderRef.current = null;
        setIconDropTargetFolderId(null);

        const selections = store.desktopSelections;
        const folderNode = store.fsNodeMap[targetFolderId];
        const folderName = folderNode?.name ?? "folder";
        const fsSelectionIds = selections
          .filter((id) => id.startsWith("fs:"))
          .map((id) => id.slice(3))
          .filter((nodeId) => nodeId !== targetFolderId);

        if (fsSelectionIds.length > 0) {
          for (const nodeId of fsSelectionIds) {
            void store.fsMoveNode(nodeId, targetFolderId);
          }

          store.pushNotification({
            title: "Moved to folder",
            body: `Moved ${fsSelectionIds.length} item${fsSelectionIds.length !== 1 ? "s" : ""} to ${folderName}`,
            level: "success",
          });
        }
      }

      endFileDrag();
      endSplitResize();
      endWindowResize();
      endMarquee(desktopItems, handleMarqueeEnd);
      setDesktopIconDragState(null);
      setDesktopWidgetDragState(null);
      store.persistDesktopPositions();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
    };
  }, [
    desktopBounds,
    desktopIconDragState,
    desktopWidgetDragState,
    endWindowDrag,
    endFileDrag,
    endSplitResize,
    endWindowResize,
    snapWindowToZone,
    splitResizeState,
    updateSplitResize,
    updateFileDrag,
    updateWindowDrag,
    updateWindowResize,
    updateMarquee,
    endMarquee,
    desktopItems,
    handleMarqueeEnd,
  ]);
}
