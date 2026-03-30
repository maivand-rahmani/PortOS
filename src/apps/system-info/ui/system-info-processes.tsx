import { Eye, Power, ScanSearch } from "lucide-react";

import { cn } from "@/shared/lib";

import type { RuntimeProcessRow, RuntimeWindowRow } from "../model/types";
import {
  ActionButton,
  DetailBlock,
  DetailRow,
  ProcessMeta,
  SectionHeader,
  SelectableCell,
} from "./system-info-primitives";

export function SystemInfoProcesses({
  processRows,
  selectedProcess,
  selectedWindow,
  setSelectedProcessId,
  spotlightSelectedTarget,
  terminateSelectedTarget,
  sendSelectedTargetToTerminal,
}: {
  processRows: RuntimeProcessRow[];
  selectedProcess: RuntimeProcessRow | null;
  selectedWindow: RuntimeWindowRow | null;
  setSelectedProcessId: (id: string) => void;
  spotlightSelectedTarget: () => void;
  terminateSelectedTarget: () => void;
  sendSelectedTargetToTerminal: () => void;
}) {
  return (
    <section className="border-b border-[#111111]">
      <SectionHeader title="Processes" icon={Power} meta="Select A Process" />
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="border-b border-[#111111] xl:border-b-0 xl:border-r">
          {processRows.length > 0 ? (
            processRows.map((process, index) => {
              const isSelected = process.id === selectedProcess?.id;

              return (
                <button
                  key={process.id}
                  type="button"
                  onClick={() => setSelectedProcessId(process.id)}
                  className={cn(
                    "grid w-full cursor-pointer border-b border-[#111111] text-left transition-colors duration-200 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_170px_130px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-inset",
                    isSelected ? "bg-[#111111] text-[#f9f9f7]" : index % 2 === 0 ? "bg-[#f9f9f7] hover:bg-[#f5f5f5]" : "bg-[#f5f5f5] hover:bg-[#ecece8]",
                  )}
                >
                  <SelectableCell inverted={isSelected} className="border-r border-[#111111] px-4 py-4">
                    <p className="font-serif text-2xl font-bold leading-tight">{process.name}</p>
                    <p className={cn("mt-1 font-mono text-xs uppercase tracking-[0.18em]", isSelected ? "text-[#d4d4d4]" : "text-[#737373]")}>{process.appId}</p>
                    <p className={cn("mt-3 text-sm leading-6", isSelected ? "text-[#f5f5f5]" : "text-[#404040]")}>{process.windowTitle}</p>
                  </SelectableCell>

                  <SelectableCell inverted={isSelected} className="border-r border-[#111111] px-4 py-4">
                    <ProcessMeta label="State" value={process.windowState} inverted={isSelected} />
                    <ProcessMeta label="Started" value={process.startedLabel} inverted={isSelected} className="mt-4" />
                  </SelectableCell>

                  <SelectableCell inverted={isSelected} className="px-4 py-4">
                    <ProcessMeta label="Uptime" value={process.uptimeLabel} inverted={isSelected} />
                    <div className="mt-4 inline-flex border border-[#111111] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                      {process.isFocused ? "Focused" : "Background"}
                    </div>
                  </SelectableCell>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-4 text-sm leading-7 text-[#404040]">No active processes.</div>
          )}
        </div>

        <aside className="min-h-0">
          <SectionHeader title="Selected Process" icon={Eye} meta="Detail Panel" />
          {selectedProcess ? (
            <div>
              <DetailBlock title="Identity">
                <DetailRow label="Name" value={selectedProcess.name} />
                <DetailRow label="App ID" value={selectedProcess.appId} />
                <DetailRow label="Window" value={selectedProcess.windowTitle} />
              </DetailBlock>

              <DetailBlock title="Runtime State">
                <DetailRow label="Window State" value={selectedProcess.windowState} />
                <DetailRow label="Started" value={selectedProcess.startedLabel} />
                <DetailRow label="Uptime" value={selectedProcess.uptimeLabel} />
                <DetailRow label="Focused" value={selectedProcess.isFocused ? "Yes" : "No"} />
              </DetailBlock>

              <DetailBlock title="Window Context">
                <DetailRow label="Visible State" value={selectedWindow?.state ?? "No Window"} />
                <DetailRow label="Size" value={selectedWindow?.sizeLabel ?? "-"} />
                <DetailRow label="Z-Index" value={selectedWindow ? String(selectedWindow.zIndex) : "-"} />
              </DetailBlock>

              <div className="grid gap-3 border-t border-[#111111] px-4 py-4">
                <ActionButton label="Spotlight Window" onClick={spotlightSelectedTarget} />
                <ActionButton label="Inspect In Terminal" onClick={sendSelectedTargetToTerminal} />
                {selectedProcess.isKillable ? (
                  <ActionButton label="Terminate Selected Process" onClick={terminateSelectedTarget} tone="dark" />
                ) : (
                  <div className="border border-[#111111] px-3 py-3 font-mono text-xs uppercase tracking-[0.16em] text-[#737373]">
                    System Info is protected from self-termination.
                  </div>
                )}
              </div>

              <div className="px-4 pb-4">
                <div className="flex items-start gap-3 border border-[#111111] px-3 py-3 text-sm leading-6 text-[#404040]">
                  <ScanSearch className="mt-1 h-4 w-4 shrink-0 text-[#111111]" strokeWidth={1.8} />
                  Spotlight restores minimized windows before focusing them so the operator can inspect the exact runtime target.
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 text-sm leading-7 text-[#404040]">No running process selected.</div>
          )}
        </aside>
      </div>
    </section>
  );
}
