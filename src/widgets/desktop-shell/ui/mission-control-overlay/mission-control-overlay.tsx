import { AnimatePresence, motion } from "framer-motion";

import type { WorkspaceRenderItem } from "../../model/desktop-shell.types";
import { MissionControlSpaceStrip } from "./mission-control-space-strip";
import { MissionControlWorkspacePreview } from "./mission-control-workspace-preview";

type MissionControlOverlayProps = {
  isOpen: boolean;
  workspaces: WorkspaceRenderItem[];
  highlightedWorkspaceId: string;
  selectedWindowId: string | null;
  onClose: () => void;
  onHighlightWorkspace: (workspaceId: string) => void;
  onCommitWorkspace: (workspaceId: string) => void;
  onSelectWindow: (windowId: string) => void;
  onCreateDesktop: () => void;
  onCloseSpace: (workspaceId: string) => void;
};

export function MissionControlOverlay({
  isOpen,
  workspaces,
  highlightedWorkspaceId,
  selectedWindowId,
  onClose,
  onHighlightWorkspace,
  onCommitWorkspace,
  onSelectWindow,
  onCreateDesktop,
  onCloseSpace,
}: MissionControlOverlayProps) {
  const highlightedWorkspace =
    workspaces.find((workspace) => workspace.workspace.id === highlightedWorkspaceId) ?? null;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[9650] bg-[rgba(8,10,16,0.42)] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={onClose}
        >
          <div className="absolute inset-0 px-6 py-10" onClick={(event) => event.stopPropagation()}>
            <MissionControlSpaceStrip
              workspaces={workspaces}
              highlightedWorkspaceId={highlightedWorkspaceId}
              onHighlight={onHighlightWorkspace}
              onCommit={onCommitWorkspace}
              onCreateDesktop={onCreateDesktop}
              onCloseSpace={onCloseSpace}
            />

            <MissionControlWorkspacePreview
              workspace={highlightedWorkspace}
              selectedWindowId={selectedWindowId}
              onSelectWindow={onSelectWindow}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
