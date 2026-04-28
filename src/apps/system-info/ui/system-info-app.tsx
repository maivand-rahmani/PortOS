"use client";

import { useEffect } from "react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";

import { buildSystemInfoAiContext } from "../model/system-info-ai-context";
import { useSystemInfoController } from "../model/use-system-info-controller";
import { SystemInfoDiagnostics } from "./system-info-diagnostics";
import { SystemInfoOverview } from "./system-info-overview";
import { SystemInfoProcesses } from "./system-info-processes";
import { SystemInfoWindows } from "./system-info-windows";

export function SystemInfoApp({ processId, windowId }: AppComponentProps) {
  const controller = useSystemInfoController({ windowId });
  const aiPublishWindowContext = useOSStore((state) => state.aiPublishWindowContext);
  const aiClearWindowContext = useOSStore((state) => state.aiClearWindowContext);

  useEffect(() => {
    aiPublishWindowContext(
      windowId,
      buildSystemInfoAiContext({
        windowId,
        processCount: controller.content.processRows.length,
        windowCount: controller.content.windowRows.length,
        appCount: controller.content.headlineStats.activeAppCount,
        selectedProcessId: controller.selectedProcessId,
        selectedProcessName: controller.selectedProcess?.name ?? null,
        selectedDiagnosticId: controller.selectedDiagnostic?.id ?? "",
        bootProgress: controller.bootProgress,
      }),
    );
  }, [aiPublishWindowContext, controller.bootProgress, controller.content.headlineStats.activeAppCount, controller.content.processRows.length, controller.content.windowRows.length, controller.selectedDiagnostic?.id, controller.selectedProcess?.name, controller.selectedProcessId, windowId]);

  useEffect(() => {
    return () => {
      aiClearWindowContext(windowId);
    };
  }, [aiClearWindowContext, windowId]);

  return (
    <div className="system-info-app system-info-texture flex h-full min-h-0 flex-col bg-[#f9f9f7] text-[#111111]">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="min-h-full space-y-0">
          <SystemInfoOverview content={controller.content} bootProgress={controller.bootProgress} processId={processId} />
          <SystemInfoDiagnostics
            content={controller.content}
            selectedDiagnostic={controller.selectedDiagnostic}
            selectedTarget={controller.selectedTarget}
            setSelectedDiagnosticId={(id) => controller.setSelectedDiagnosticId(id)}
            exportSelectedIncident={() => void controller.exportSelectedIncident()}
            sendSelectedTargetToTerminal={() => void controller.sendSelectedTargetToTerminal()}
          />
          <SystemInfoProcesses
            processRows={controller.content.processRows}
            selectedProcess={controller.selectedProcess}
            selectedWindow={controller.selectedWindow}
            setSelectedProcessId={(id) => controller.setSelectedProcessId(id)}
            spotlightSelectedTarget={() => void controller.spotlightSelectedTarget()}
            terminateSelectedTarget={() => void controller.terminateSelectedTarget()}
            sendSelectedTargetToTerminal={() => void controller.sendSelectedTargetToTerminal()}
          />
          <SystemInfoWindows windowRows={controller.content.windowRows} />
        </div>
      </div>
    </div>
  );
}
