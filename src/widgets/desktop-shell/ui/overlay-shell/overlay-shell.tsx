"use client";

import { AnimatePresence } from "framer-motion";

import type { OSBootPhase } from "@/processes";
import { SpotlightOverlay } from "@/features/spotlight-search";
import type { DockAppState, WorkspaceRenderItem } from "../../model/desktop-shell.types";
import { AiCommandPalette } from "../ai-command-palette";
import { AppSwitcherOverlay } from "../app-switcher-overlay/app-switcher-overlay";
import { BootOverlay } from "../boot-overlay";
import { MissionControlOverlay } from "../mission-control-overlay";

type OverlayShellProps = {
  isBooting: boolean;
  bootPhase: Exclude<OSBootPhase, "ready">;
  bootProgress: number;
  bootMessages: string[];
  isAppSwitcherOpen: boolean;
  switcherApps: DockAppState[];
  selectedSwitcherAppId: string | null;
  isMissionControlOpen: boolean;
  workspaceRenderItems: WorkspaceRenderItem[];
  highlightedWorkspaceId: string;
  selectedWindowId: string | null;
  isSpotlightOpen: boolean;
  onCloseMissionControl: () => void;
  onHighlightWorkspace: (id: string) => void;
  onCommitWorkspace: (id: string) => void;
  onSelectWindow: (id: string) => void;
  onCreateDesktop: () => void;
  onCloseSpace: (id: string) => void;
  onPreviewSwitcherApp: (id: string) => void;
  onActivateSelectedApp: () => void;
  onCloseSpotlight: () => void;
  onOpenApp: (id: string) => void;
  onFocusWindow: (id: string) => void;
  onRunShortcut: (shortcutId: string, options?: { ignoreSurfaceState?: boolean }) => boolean;
};

export function OverlayShell({
  isBooting,
  bootPhase,
  bootProgress,
  bootMessages,
  isAppSwitcherOpen,
  switcherApps,
  selectedSwitcherAppId,
  isMissionControlOpen,
  workspaceRenderItems,
  highlightedWorkspaceId,
  selectedWindowId,
  isSpotlightOpen,
  onCloseMissionControl,
  onHighlightWorkspace,
  onCommitWorkspace,
  onSelectWindow,
  onCreateDesktop,
  onCloseSpace,
  onPreviewSwitcherApp,
  onActivateSelectedApp,
  onCloseSpotlight,
  onOpenApp,
  onFocusWindow,
  onRunShortcut,
}: OverlayShellProps) {
  return (
    <>
      <AnimatePresence>
        {isBooting ? (
          <BootOverlay
            phase={bootPhase}
            progress={bootProgress}
            messages={bootMessages}
          />
        ) : null}
      </AnimatePresence>

      <AppSwitcherOverlay
        isOpen={isAppSwitcherOpen}
        apps={switcherApps}
        selectedAppId={selectedSwitcherAppId}
        onPreview={onPreviewSwitcherApp}
        onActivate={onActivateSelectedApp}
      />

      <MissionControlOverlay
        isOpen={isMissionControlOpen}
        workspaces={workspaceRenderItems}
        highlightedWorkspaceId={highlightedWorkspaceId}
        selectedWindowId={selectedWindowId}
        onClose={onCloseMissionControl}
        onHighlightWorkspace={onHighlightWorkspace}
        onCommitWorkspace={onCommitWorkspace}
        onSelectWindow={onSelectWindow}
        onCreateDesktop={onCreateDesktop}
        onCloseSpace={onCloseSpace}
      />

      <AiCommandPalette />

      <SpotlightOverlay
        isOpen={isSpotlightOpen}
        onClose={onCloseSpotlight}
        onOpenApp={onOpenApp}
        onFocusWindow={onFocusWindow}
        onRunShortcut={onRunShortcut}
      />
    </>
  );
}
