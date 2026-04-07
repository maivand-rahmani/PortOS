"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";

import {
  useOSStore,
  type AiActionId,
  type AiServiceResult,
  type AiServiceStatus,
} from "@/processes";

import { AiCommandPalettePanel } from "./ai-command-palette-panel";

const PANEL_MAX_WIDTH = 980;
const PANEL_MAX_HEIGHT = 700;
const PANEL_EDGE_GAP = 16;

type ViewportSize = {
  width: number;
  height: number;
};

type PanelMetrics = {
  left: number | string;
  top: number;
  width: number;
  height: number;
};

export function AiCommandPalette() {
  const isOpen = useOSStore((state) => state.aiPaletteOpen);
  const context = useOSStore((state) => state.aiPaletteContext);
  const aiStatus = useOSStore((state) => state.aiStatus);
  const aiStreamContent = useOSStore((state) => state.aiStreamContent);
  const aiLastResult = useOSStore((state) => state.aiLastResult);
  const aiError = useOSStore((state) => state.aiError);
  const aiClosePalette = useOSStore((state) => state.aiClosePalette);
  const aiExecuteAction = useOSStore((state) => state.aiExecuteAction);
  const aiApplyResult = useOSStore((state) => state.aiApplyResult);
  const aiCancelRequest = useOSStore((state) => state.aiCancelRequest);
  const aiMessages = useOSStore((state) => state.aiMessages);
  const aiStartNewSession = useOSStore((state) => state.aiStartNewSession);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const viewport = useViewportSize();

  const panelMetrics = getPanelMetrics(viewport);

  return (
    <AnimatePresence initial={false}>
      {isOpen && context ? (
        <AiCommandPalettePanel
          key={`${context.sourceWindowId}:${context.file?.nodeId ?? "no-file"}:${context.file?.path ?? "no-path"}`}
          context={context}
          aiStatus={aiStatus}
          aiStreamContent={aiStreamContent}
          aiLastResult={aiLastResult}
          aiError={aiError}
          aiMessages={aiMessages}
          aiStartNewSession={aiStartNewSession}
          aiClosePalette={aiClosePalette}
          aiExecuteAction={aiExecuteAction}
          aiApplyResult={aiApplyResult}
          aiCancelRequest={aiCancelRequest}
          shouldReduceMotion={shouldReduceMotion}
          panelMetrics={panelMetrics}
        />
      ) : null}
    </AnimatePresence>
  );
}

function getPanelMetrics(viewport: ViewportSize): PanelMetrics {
  const width =
    viewport.width > 0
      ? Math.min(PANEL_MAX_WIDTH, Math.max(0, viewport.width - PANEL_EDGE_GAP * 2))
      : PANEL_MAX_WIDTH;
  const height =
    viewport.height > 0
      ? Math.min(PANEL_MAX_HEIGHT, Math.max(0, viewport.height - PANEL_EDGE_GAP * 2))
      : PANEL_MAX_HEIGHT;

  return {
    left: "50%",
    top: viewport.height > 0 ? Math.max(PANEL_EDGE_GAP, Math.round((viewport.height - height) / 2)) : 72,
    width,
    height,
  };
}

function useViewportSize(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>(() => {
    if (typeof window === "undefined") {
      return { width: 0, height: 0 };
    }

    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport((current) => {
        const next = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        if (current.width === next.width && current.height === next.height) {
          return current;
        }

        return next;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return viewport;
}

export type { AiActionId, AiServiceResult, AiServiceStatus };
