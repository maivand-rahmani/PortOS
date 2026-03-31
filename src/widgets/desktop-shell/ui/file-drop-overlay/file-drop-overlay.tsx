"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { FileDropTarget } from "@/processes";
import type { WindowRenderItem } from "../../model/desktop-shell.types";

type FileDropOverlayProps = {
  fileDragNodeId: string | null;
  fileDropTarget: FileDropTarget | null;
  windows: WindowRenderItem[];
};

export function FileDropOverlay({
  fileDragNodeId,
  fileDropTarget,
  windows,
}: FileDropOverlayProps) {
  const dropWindows = windows.filter(
    (entry) => entry.window.appId === "editor" || entry.window.appId === "files",
  );

  return (
    <AnimatePresence>
      {fileDragNodeId ? (
        <>
          {dropWindows.map(({ window, app }) => {
            const isActiveTarget =
              fileDropTarget?.windowId === window.id && fileDropTarget.appId === window.appId;

            return (
              <motion.div
                key={`file-drop:${window.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActiveTarget ? 1 : 0.72 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute rounded-[30px] border border-sky-400/35 bg-sky-400/8 shadow-[0_0_0_1px_rgba(56,189,248,0.08)_inset,0_0_42px_rgba(56,189,248,0.18)]"
                style={{
                  left: window.position.x,
                  top: window.position.y,
                  width: window.size.width,
                  height: window.size.height,
                  zIndex: window.zIndex + 1,
                }}
              >
                <div className="absolute inset-x-0 top-0 flex justify-center pt-5">
                  <div className="rounded-full border border-white/14 bg-[rgba(16,24,32,0.78)] px-3 py-1 text-[11px] font-medium text-white/82 backdrop-blur-xl">
                    Drop into {app.name}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </>
      ) : null}
    </AnimatePresence>
  );
}
