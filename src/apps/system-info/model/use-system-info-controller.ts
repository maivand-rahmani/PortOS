"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import {
  consumeSystemInfoExternalRequest,
  SYSTEM_INFO_EXTERNAL_REQUEST_EVENT,
  type SystemInfoExternalRequestDetail,
} from "@/shared/lib";

import {
  exportIncidentSnapshotToNotes,
  handoffRuntimeTargetToTerminal,
  spotlightRuntimeWindow,
  terminateRuntimeProcess,
} from "./system-info-actions";
import { buildSystemInfoContent } from "./content";
import type { RuntimeDiagnostic, SelectedRuntimeTarget } from "./types";

function resolveSelectedProcessId(
  requestedProcessId: string | null,
  requestedWindowId: string | null,
  fallbackProcessId: string | null,
  processRows: ReturnType<typeof buildSystemInfoContent>["processRows"],
  windowRows: ReturnType<typeof buildSystemInfoContent>["windowRows"],
) {
  if (requestedProcessId && processRows.some((process) => process.id === requestedProcessId)) {
    return requestedProcessId;
  }

  if (requestedWindowId) {
    const window = windowRows.find((entry) => entry.id === requestedWindowId);

    if (window && processRows.some((process) => process.id === window.processId)) {
      return window.processId;
    }
  }

  if (fallbackProcessId && processRows.some((process) => process.id === fallbackProcessId)) {
    return fallbackProcessId;
  }

  return processRows[0]?.id ?? "";
}

function resolveSelectedDiagnosticId(
  currentDiagnosticId: string | null,
  diagnostics: RuntimeDiagnostic[],
  openIncidentSnapshot: boolean,
) {
  if (currentDiagnosticId && diagnostics.some((item) => item.id === currentDiagnosticId)) {
    return currentDiagnosticId;
  }

  if (openIncidentSnapshot) {
    return diagnostics.find((item) => item.severity !== "healthy")?.id ?? diagnostics[0]?.id ?? "";
  }

  return diagnostics[0]?.id ?? "";
}

export function useSystemInfoController({ windowId }: Pick<AppComponentProps, "windowId">) {
  const apps = useOSStore((state) => state.apps);
  const processes = useOSStore((state) => state.processes);
  const windows = useOSStore((state) => state.windows);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const bootProgress = useOSStore((state) => state.bootProgress);

  const content = useMemo(
    () =>
      buildSystemInfoContent({
        apps,
        processes,
        windows,
        activeWindowId,
        bootProgress,
      }),
    [activeWindowId, apps, bootProgress, processes, windows],
  );

  const [requestedProcessId, setSelectedProcessId] = useState(content.processRows[0]?.id ?? "");
  const [requestedDiagnosticId, setSelectedDiagnosticId] = useState(content.diagnostics[0]?.id ?? "");

  const selectedProcessId = useMemo(
    () => resolveSelectedProcessId(null, null, requestedProcessId, content.processRows, content.windowRows),
    [content.processRows, content.windowRows, requestedProcessId],
  );
  const selectedDiagnosticId = useMemo(
    () => resolveSelectedDiagnosticId(requestedDiagnosticId, content.diagnostics, false),
    [content.diagnostics, requestedDiagnosticId],
  );

  const selectedProcess = content.processRows.find((process) => process.id === selectedProcessId) ?? content.processRows[0] ?? null;
  const selectedWindow = content.windowRows.find((window) => window.processId === selectedProcess?.id) ?? null;
  const selectedDiagnostic =
    content.diagnostics.find((diagnostic) => diagnostic.id === selectedDiagnosticId) ?? content.diagnostics[0] ?? null;

  useEffect(() => {
    const applyExternalRequest = (request: SystemInfoExternalRequestDetail | null) => {
      if (!request || (request.targetWindowId && request.targetWindowId !== windowId)) {
        return;
      }

      setSelectedProcessId((current) =>
        resolveSelectedProcessId(request.processId ?? null, request.windowId ?? null, current, content.processRows, content.windowRows),
      );
      setSelectedDiagnosticId((current) => resolveSelectedDiagnosticId(current, content.diagnostics, Boolean(request.openIncidentSnapshot)));

      if (request.openIncidentSnapshot) {
        const processId = resolveSelectedProcessId(
          request.processId ?? null,
          request.windowId ?? null,
          selectedProcess?.id ?? null,
          content.processRows,
          content.windowRows,
        );
        const process = content.processRows.find((entry) => entry.id === processId) ?? content.processRows[0] ?? null;
        const window = content.windowRows.find((entry) => entry.processId === process?.id) ?? null;
        const diagnostic =
          content.diagnostics.find((entry) => entry.severity !== "healthy") ?? content.diagnostics[0] ?? null;

        void exportIncidentSnapshotToNotes(
          {
            apps,
            processes,
            windows,
            activeWindowId,
            bootProgress,
            content,
            note: request.note,
          },
          diagnostic,
          { process, window },
        );
      }
    };

    const handleExternalRequest = (event: Event) => {
      applyExternalRequest((event as CustomEvent<SystemInfoExternalRequestDetail>).detail);
    };

    applyExternalRequest(consumeSystemInfoExternalRequest(windowId));
    window.addEventListener(SYSTEM_INFO_EXTERNAL_REQUEST_EVENT, handleExternalRequest);

    return () => {
      window.removeEventListener(SYSTEM_INFO_EXTERNAL_REQUEST_EVENT, handleExternalRequest);
    };
  }, [
    activeWindowId,
    apps,
    bootProgress,
    content,
    processes,
    selectedProcess?.id,
    windowId,
    windows,
  ]);

  const selectedTarget: SelectedRuntimeTarget = useMemo(
    () => ({
      process: selectedProcess,
      window: selectedWindow,
    }),
    [selectedProcess, selectedWindow],
  );

  const spotlightSelectedTarget = useCallback(async () => {
    await spotlightRuntimeWindow(selectedTarget.window);
  }, [selectedTarget.window]);

  const sendSelectedTargetToTerminal = useCallback(async () => {
    await handoffRuntimeTargetToTerminal(selectedTarget);
  }, [selectedTarget]);

  const exportSelectedIncident = useCallback(async () => {
    await exportIncidentSnapshotToNotes(
      {
        apps,
        processes,
        windows,
        activeWindowId,
        bootProgress,
        content,
      },
      selectedDiagnostic,
      selectedTarget,
    );
  }, [activeWindowId, apps, bootProgress, content, processes, selectedDiagnostic, selectedTarget, windows]);

  const terminateSelectedTarget = useCallback(async () => {
    await terminateRuntimeProcess(selectedTarget.process);
  }, [selectedTarget.process]);

  return {
    content,
    selectedDiagnostic,
    selectedProcess,
    selectedProcessId,
    selectedTarget,
    selectedWindow,
    bootProgress,
    setSelectedDiagnosticId,
    setSelectedProcessId,
    exportSelectedIncident,
    sendSelectedTargetToTerminal,
    spotlightSelectedTarget,
    terminateSelectedTarget,
  };
}
