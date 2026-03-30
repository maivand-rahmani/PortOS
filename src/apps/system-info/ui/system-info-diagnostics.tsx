import { AlertTriangle, NotebookPen, ShieldCheck, Siren, TerminalSquare } from "lucide-react";

import type { RuntimeDiagnostic, SelectedRuntimeTarget, SystemInfoContent } from "../model/types";
import { ActionButton, DetailBlock, DetailRow, SectionHeader } from "./system-info-primitives";

const SEVERITY_STYLES = {
  critical: {
    badge: "bg-[#111111] text-[#f9f9f7]",
    label: "Critical",
    icon: Siren,
  },
  warning: {
    badge: "bg-[#f3e6e6] text-[#7a1010]",
    label: "Watch",
    icon: AlertTriangle,
  },
  healthy: {
    badge: "bg-[#ebf2eb] text-[#1f5c2c]",
    label: "Healthy",
    icon: ShieldCheck,
  },
} as const;

export function SystemInfoDiagnostics({
  content,
  selectedDiagnostic,
  selectedTarget,
  setSelectedDiagnosticId,
  exportSelectedIncident,
  sendSelectedTargetToTerminal,
}: {
  content: SystemInfoContent;
  selectedDiagnostic: RuntimeDiagnostic | null;
  selectedTarget: SelectedRuntimeTarget;
  setSelectedDiagnosticId: (id: string) => void;
  exportSelectedIncident: () => void;
  sendSelectedTargetToTerminal: () => void;
}) {
  const activeSeverity = selectedDiagnostic ? SEVERITY_STYLES[selectedDiagnostic.severity] : null;
  const ActiveIcon = activeSeverity?.icon ?? ShieldCheck;

  return (
    <section className="border-b border-[#111111]">
      <SectionHeader title="Diagnostics" icon={AlertTriangle} meta="Action Center" />
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="border-b border-[#111111] xl:border-b-0 xl:border-r">
          {content.diagnostics.map((diagnostic, index) => {
            const severity = SEVERITY_STYLES[diagnostic.severity];
            const Icon = severity.icon;
            const isSelected = diagnostic.id === selectedDiagnostic?.id;

            return (
              <button
                key={diagnostic.id}
                type="button"
                onClick={() => setSelectedDiagnosticId(diagnostic.id)}
                className={`grid w-full cursor-pointer gap-3 border-b border-[#111111] px-4 py-4 text-left transition-colors duration-200 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-inset ${
                  isSelected ? "bg-[#111111] text-[#f9f9f7]" : index % 2 === 0 ? "bg-[#f9f9f7] hover:bg-[#f5f5f5]" : "bg-[#f5f5f5] hover:bg-[#ecece8]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 flex h-10 w-10 items-center justify-center border border-[#111111] ${isSelected ? "bg-[#f9f9f7] text-[#111111]" : "bg-transparent text-[#111111]"}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${isSelected ? "text-[#d4d4d4]" : "text-[#737373]"}`}>
                        Runtime signal
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold leading-tight">{diagnostic.title}</p>
                    </div>
                  </div>
                  <span className={`inline-flex min-h-[44px] items-center border border-[#111111] px-3 text-[10px] font-semibold uppercase tracking-[0.18em] ${isSelected ? "bg-[#f9f9f7] text-[#111111]" : severity.badge}`}>
                    {severity.label}
                  </span>
                </div>
                <p className={`text-sm leading-7 ${isSelected ? "text-[#f5f5f5]" : "text-[#404040]"}`}>{diagnostic.detail}</p>
                <p className={`font-mono text-[11px] uppercase tracking-[0.18em] ${isSelected ? "text-[#d4d4d4]" : "text-[#737373]"}`}>
                  {diagnostic.recommendation}
                </p>
              </button>
            );
          })}
        </div>

        <aside>
          <SectionHeader title="Incident Flow" icon={NotebookPen} meta="Operator Tools" />
          <DetailBlock title="Health Status">
            <div className="flex items-center justify-between gap-3 border border-[#111111] px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-[#111111] bg-[#111111] text-[#f9f9f7]">
                  <ActiveIcon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">Runtime health</p>
                  <p className="font-serif text-3xl font-bold leading-none">{content.runtimeHealth.score}</p>
                </div>
              </div>
              <div className={`inline-flex min-h-[44px] items-center border border-[#111111] px-3 text-[10px] font-semibold uppercase tracking-[0.18em] ${activeSeverity?.badge ?? "bg-[#ebf2eb] text-[#1f5c2c]"}`}>
                {content.runtimeHealth.label}
              </div>
            </div>
            <DetailRow label="Operator note" value={content.runtimeHealth.note} />
            <DetailRow label="Selected process" value={selectedTarget.process?.name ?? "No running process"} />
            <DetailRow label="Selected window" value={selectedTarget.window?.title ?? "No linked window"} />
          </DetailBlock>

          <div className="grid gap-3 border-b border-[#111111] px-4 py-4">
            <ActionButton label="Export Incident Snapshot To Notes" onClick={exportSelectedIncident} tone="dark" />
            <ActionButton label="Send Inspection To Terminal" onClick={sendSelectedTargetToTerminal} />
          </div>

          <DetailBlock title="Field Notes">
            {content.systemNotes.map((note) => (
              <p key={note} className="text-sm leading-7 text-[#404040]">
                {note}
              </p>
            ))}
          </DetailBlock>

          <div className="grid grid-cols-2 gap-3 px-4 py-4">
            <div className="border border-[#111111] px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">Terminal handoff</p>
              <p className="mt-2 text-sm leading-6 text-[#404040]">
                Opens Terminal with a target-aware runtime command so the next operator action is already lined up.
              </p>
              <TerminalSquare className="mt-3 h-4 w-4 text-[#111111]" strokeWidth={1.8} />
            </div>
            <div className="border border-[#111111] px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">Notes export</p>
              <p className="mt-2 text-sm leading-6 text-[#404040]">
                Persists the live signal, target, and recommended next steps into Notes for follow-up.
              </p>
              <NotebookPen className="mt-3 h-4 w-4 text-[#111111]" strokeWidth={1.8} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
