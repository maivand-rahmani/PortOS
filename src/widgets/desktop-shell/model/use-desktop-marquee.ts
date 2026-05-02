"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WindowPosition } from "@/entities/window";
import type { DesktopItem } from "./desktop-context-menu/desktop-context-menu.types";

export type DesktopMarqueeState = {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

const ICON_WIDTH = 88;
const ICON_HEIGHT = 96;

function rectIntersects(
  marqueeLeft: number,
  marqueeTop: number,
  marqueeRight: number,
  marqueeBottom: number,
  iconX: number,
  iconY: number,
): boolean {
  const iconRight = iconX + ICON_WIDTH;
  const iconBottom = iconY + ICON_HEIGHT;

  return !(
    iconRight < marqueeLeft ||
    iconX > marqueeRight ||
    iconBottom < marqueeTop ||
    iconY > marqueeBottom
  );
}

export function useDesktopMarquee() {
  const [state, setState] = useState<DesktopMarqueeState>({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const startMetaRef = useRef(false);

  // Prevent text selection during marquee drag
  useEffect(() => {
    if (!state.isActive) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.userSelect = prevUserSelect;
    };
  }, [state.isActive]);

  const beginMarquee = useCallback(
    (pointer: WindowPosition, metaKey: boolean) => {
      startMetaRef.current = metaKey;
      setState({
        isActive: true,
        startX: pointer.x,
        startY: pointer.y,
        currentX: pointer.x,
        currentY: pointer.y,
      });
    },
    [],
  );

  const updateMarquee = useCallback((pointer: WindowPosition) => {
    setState((prev) =>
      prev.isActive
        ? { ...prev, currentX: pointer.x, currentY: pointer.y }
        : prev,
    );
  }, []);

  const endMarquee = useCallback(
    (
      desktopItems: DesktopItem[],
      onSelect: (ids: string[], isAdditive: boolean) => void,
    ) => {
      setState((prev) => {
        if (!prev.isActive) return prev;

        const marqueeLeft = Math.min(prev.startX, prev.currentX);
        const marqueeTop = Math.min(prev.startY, prev.currentY);
        const marqueeRight = Math.max(prev.startX, prev.currentX);
        const marqueeBottom = Math.max(prev.startY, prev.currentY);
        const marqueeWidth = marqueeRight - marqueeLeft;
        const marqueeHeight = marqueeBottom - marqueeTop;

        // Only select if drag was significant (>5px)
        if (marqueeWidth < 5 && marqueeHeight < 5) {
          onSelect([], false);
          return { ...prev, isActive: false };
        }

        const intersectedIds = desktopItems
          .filter((item) =>
            rectIntersects(
              marqueeLeft,
              marqueeTop,
              marqueeRight,
              marqueeBottom,
              item.position.x,
              item.position.y,
            ),
          )
          .map((item) =>
            item.kind === "app"
              ? `app:${item.app.id}`
              : `fs:${item.node.id}`,
          );

        onSelect(intersectedIds, startMetaRef.current);

        return { ...prev, isActive: false };
      });
    },
    [],
  );

  const cancelMarquee = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: false }));
  }, []);

  return {
    marqueeState: state,
    beginMarquee,
    updateMarquee,
    endMarquee,
    cancelMarquee,
  };
}
