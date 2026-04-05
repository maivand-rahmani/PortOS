"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { WorkspaceId } from "@/entities/workspace";

import type { WorkspaceRenderItem } from "./desktop-shell.types";

function getDefaultSelectedWindowId(workspace: WorkspaceRenderItem | null): string | null {
  if (!workspace) {
    return null;
  }

  return (
    workspace.windows.find((item) => item.isActive)?.window.id ??
    workspace.windows.at(-1)?.window.id ??
    null
  );
}

type UseMissionControlInput = {
  currentWorkspaceId: WorkspaceId;
  workspaces: WorkspaceRenderItem[];
  onCommitWorkspace: (workspaceId: WorkspaceId) => void;
  onCommitWindow: (windowId: string) => void;
};

type UseMissionControlResult = {
  isOpen: boolean;
  highlightedWorkspaceId: WorkspaceId;
  selectedWindowId: string | null;
  openMissionControl: () => void;
  closeMissionControl: () => void;
  highlightWorkspace: (workspaceId: WorkspaceId) => void;
  moveHighlight: (direction: -1 | 1) => void;
  commitWorkspace: (workspaceId: WorkspaceId) => void;
  commitWindow: (windowId: string) => void;
  confirmSelection: () => void;
};

export function useMissionControl({
  currentWorkspaceId,
  workspaces,
  onCommitWorkspace,
  onCommitWindow,
}: UseMissionControlInput): UseMissionControlResult {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedWorkspaceId, setHighlightedWorkspaceId] = useState(currentWorkspaceId);

  const orderedWorkspaceIds = useMemo(
    () => workspaces.map((workspace) => workspace.workspace.id),
    [workspaces],
  );

  const safeHighlightedWorkspaceId = useMemo(() => {
    if (orderedWorkspaceIds.includes(highlightedWorkspaceId)) {
      return highlightedWorkspaceId;
    }

    return currentWorkspaceId;
  }, [currentWorkspaceId, highlightedWorkspaceId, orderedWorkspaceIds]);

  const highlightedWorkspace = useMemo(
    () =>
      workspaces.find((workspace) => workspace.workspace.id === safeHighlightedWorkspaceId) ?? null,
    [safeHighlightedWorkspaceId, workspaces],
  );

  const selectedWindowId = useMemo(
    () => getDefaultSelectedWindowId(highlightedWorkspace),
    [highlightedWorkspace],
  );

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setHighlightedWorkspaceId(currentWorkspaceId);
  }, [currentWorkspaceId, isOpen]);

  const openMissionControl = useCallback(() => {
    setHighlightedWorkspaceId(currentWorkspaceId);
    setIsOpen(true);
  }, [currentWorkspaceId]);

  const closeMissionControl = useCallback(() => {
    setIsOpen(false);
  }, []);

  const highlightWorkspace = useCallback((workspaceId: WorkspaceId) => {
    setHighlightedWorkspaceId(workspaceId);
  }, []);

  const moveHighlight = useCallback(
    (direction: -1 | 1) => {
      const currentIndex = orderedWorkspaceIds.findIndex(
        (workspaceId) => workspaceId === safeHighlightedWorkspaceId,
      );

      if (currentIndex < 0) {
        return;
      }

      const nextIndex = currentIndex + direction;

      if (nextIndex < 0 || nextIndex >= orderedWorkspaceIds.length) {
        return;
      }

      setHighlightedWorkspaceId(orderedWorkspaceIds[nextIndex]);
    },
    [orderedWorkspaceIds, safeHighlightedWorkspaceId],
  );

  const confirmSelection = useCallback(() => {
    if (selectedWindowId) {
      onCommitWindow(selectedWindowId);
      setIsOpen(false);
      return;
    }

    onCommitWorkspace(safeHighlightedWorkspaceId);
    setIsOpen(false);
  }, [onCommitWindow, onCommitWorkspace, safeHighlightedWorkspaceId, selectedWindowId]);

  const commitWorkspace = useCallback(
    (workspaceId: WorkspaceId) => {
      onCommitWorkspace(workspaceId);
      setIsOpen(false);
    },
    [onCommitWorkspace],
  );

  const commitWindow = useCallback(
    (windowId: string) => {
      onCommitWindow(windowId);
      setIsOpen(false);
    },
    [onCommitWindow],
  );

  return {
    isOpen,
    highlightedWorkspaceId: safeHighlightedWorkspaceId,
    selectedWindowId,
    openMissionControl,
    closeMissionControl,
    highlightWorkspace,
    moveHighlight,
    commitWorkspace,
    commitWindow,
    confirmSelection,
  };
}
