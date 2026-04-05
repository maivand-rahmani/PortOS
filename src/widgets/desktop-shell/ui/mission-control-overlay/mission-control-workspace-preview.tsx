import { AnimatePresence, motion } from "framer-motion";

import type { WorkspaceRenderItem } from "../../model/desktop-shell.types";
import { MissionControlWindowThumb } from "./mission-control-window-thumb";

type MissionControlWorkspacePreviewProps = {
  workspace: WorkspaceRenderItem | null;
  selectedWindowId: string | null;
  onSelectWindow: (windowId: string) => void;
};

export function MissionControlWorkspacePreview({
  workspace,
  selectedWindowId,
  onSelectWindow,
}: MissionControlWorkspacePreviewProps) {
  return (
    <div className="relative mx-auto mt-6 h-[62vh] w-full max-w-6xl overflow-hidden rounded-[40px] border border-white/12 bg-[linear-gradient(180deg,rgba(17,20,28,0.6),rgba(17,20,28,0.34))] shadow-[0_32px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={workspace?.workspace.id ?? "empty"}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {workspace && workspace.windows.length > 0 ? (
            workspace.windows.map((item, index) => (
              <MissionControlWindowThumb
                key={item.window.id}
                item={item}
                index={index}
                isSelected={selectedWindowId === item.window.id}
                onSelect={() => onSelectWindow(item.window.id)}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-center text-white/62">
              <div>
                <p className="text-lg font-semibold text-white/82">
                  {workspace?.workspace.label ?? "No workspace selected"}
                </p>
                <p className="mt-2 text-sm">No open windows in this space.</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
