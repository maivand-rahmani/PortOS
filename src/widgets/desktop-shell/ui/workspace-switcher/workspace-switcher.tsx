"use client";

import { motion } from "framer-motion";

import type { WorkspaceDefinition, WorkspaceId } from "@/processes";

type WorkspaceSwitcherProps = {
  workspaces: WorkspaceDefinition[];
  currentWorkspaceId: WorkspaceId;
  onSwitch: (workspaceId: WorkspaceId) => void;
};

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
  onSwitch,
}: WorkspaceSwitcherProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-10 z-[650] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/14 bg-[linear-gradient(180deg,rgba(24,24,28,0.58),rgba(14,14,18,0.44))] px-2 py-1 shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
        {workspaces.map((workspace) => {
          const isActive = workspace.id === currentWorkspaceId;
          const isFullscreen = workspace.kind === "fullscreen";

          return (
            <button
              key={workspace.id}
              type="button"
              onClick={() => onSwitch(workspace.id)}
              className="relative rounded-full px-3 py-1.5 text-[11px] font-medium text-white/72 transition-colors hover:text-white"
            >
              {isActive ? (
                <motion.span
                  layoutId="workspace-pill"
                  className="absolute inset-0 rounded-full bg-white/16 ring-1 ring-white/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative z-[1] flex items-center gap-1.5">
                {isFullscreen ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/90" /> : null}
                <span>{workspace.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
