import { motion } from "framer-motion";

import type { WorkspaceRenderItem } from "../../model/desktop-shell.types";

type MissionControlSpaceStripProps = {
  workspaces: WorkspaceRenderItem[];
  highlightedWorkspaceId: string;
  onHighlight: (workspaceId: string) => void;
  onCommit: (workspaceId: string) => void;
  onCreateDesktop: () => void;
  onCloseSpace: (workspaceId: string) => void;
};

export function MissionControlSpaceStrip({
  workspaces,
  highlightedWorkspaceId,
  onHighlight,
  onCommit,
  onCreateDesktop,
  onCloseSpace,
}: MissionControlSpaceStripProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center gap-3 overflow-x-auto px-6 py-4">
      {workspaces.map(({ workspace }) => {
        const isSelected = workspace.id === highlightedWorkspaceId;
        const isFullscreen = workspace.kind === "fullscreen";
        const isSplit = workspace.splitView != null;

        return (
          <motion.div
            key={workspace.id}
            className="relative"
            layout
          >
            <button
              type="button"
              onMouseEnter={() => onHighlight(workspace.id)}
              onFocus={() => onHighlight(workspace.id)}
              onClick={() => onCommit(workspace.id)}
              className="relative min-w-[180px] overflow-hidden rounded-[26px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] px-4 py-4 text-left shadow-[0_18px_44px_rgba(0,0,0,0.24)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              style={{
                transform: isSelected ? "scale(1.03)" : undefined,
                opacity: isSelected ? 1 : 0.86,
                transition: "transform 0.18s ease-out, opacity 0.18s ease-out",
              }}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                {isFullscreen ? <span className="h-2 w-2 rounded-full bg-emerald-300" /> : null}
                {isSplit ? <span className="h-2 w-2 rounded-full bg-sky-300" /> : null}
                <span>{isFullscreen ? "Space" : "Desktop"}</span>
              </div>
              <div className="mt-3 text-sm font-semibold text-white/88">{workspace.label}</div>
            </button>

            {isFullscreen ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseSpace(workspace.id);
                }}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={`Close ${workspace.label}`}
              >
                ×
              </button>
            ) : null}
          </motion.div>
        );
      })}

      <motion.button
        type="button"
        onClick={onCreateDesktop}
        className="flex min-w-[180px] items-center justify-center rounded-[26px] border border-dashed border-white/20 bg-white/5 px-4 py-4 text-left shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <span className="text-2xl font-light text-white/50">+</span>
      </motion.button>
    </div>
  );
}
