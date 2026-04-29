"use client";

import { useEffect, useRef } from "react";

import type { DesktopBounds, WindowPosition } from "@/entities/window";
import type { WindowSnapZone } from "@/processes";

import { DESKTOP_AI_WIDGET } from "./desktop-shell.constants";
import type { DesktopIconDragState, DesktopWidgetDragState } from "./desktop-shell.types";
import type { WorkspaceSplitResizeState } from "@/processes/os/model/workspace-manager/workspace-manager.types";
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
  setDesktopIconPositions: (
    positions: Record<string, WindowPosition> | ((prev: Record<string, WindowPosition>) => Record<string, WindowPosition>),
  ) => void;
  setAiWidgetPosition: (position: WindowPosition) => void;
  setDesktopIconDragState: (state: DesktopIconDragState) => void;
  setDesktopWidgetDragState: (state: DesktopWidgetDragState) => void;
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
    setDesktopIconPositions,
    setAiWidgetPosition,
    setDesktopIconDragState,
    setDesktopWidgetDragState,
  } = params;

  const dragRafRef = useRef<number | null>(null);
  const pendingPointerEventRef = useRef<PointerEvent | null>(null);

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

        setDesktopIconPositions((current) => ({
          ...current,
          [desktopIconDragState.appId]: {
            x: Math.min(Math.max(rawX, desktopBounds.insetLeft), maxX),
            y: Math.min(Math.max(rawY, desktopBounds.insetTop), maxY),
          },
        }));
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
      const currentState = useOSStore.getState();

      if (currentState.dragState && currentState.windowSnapZone && desktopBounds) {
        const snapWindowId = currentState.dragState.windowId;
        const zone = currentState.windowSnapZone;

        endWindowDrag();
        snapWindowToZone(snapWindowId, zone, desktopBounds);
      } else {
        endWindowDrag();
      }

      endFileDrag();
      endSplitResize();
      endWindowResize();
      setDesktopIconDragState(null);
      setDesktopWidgetDragState(null);
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
  ]);
}
