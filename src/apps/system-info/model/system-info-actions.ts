import type { AppConfig } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { WindowInstance } from "@/entities/window";

import {
  focusWindowById,
  openNotesWithRequest,
  openTerminalWithCommand,
  restoreWindowById,
  terminateProcessById,
} from "@/shared/lib";

import type {
  RuntimeDiagnostic,
  RuntimeProcessRow,
  RuntimeWindowRow,
  SystemInfoContent,
} from "./types";

type RuntimeActionContext = {
  apps: AppConfig[];
  processes: ProcessInstance[];
  windows: WindowInstance[];
  activeWindowId: string | null;
  bootProgress: number;
  content: SystemInfoContent;
  note?: string;
};

function formatWindowDescriptor(window: RuntimeWindowRow | null) {
  if (!window) {
    return "No linked window";
  }

  return `${window.title} | ${window.appId} | ${window.state} | z${window.zIndex}`;
}

function formatProcessDescriptor(process: RuntimeProcessRow | null) {
  if (!process) {
    return "No linked process";
  }

  return `${process.name} | ${process.appId} | ${process.windowState} | uptime ${process.uptimeLabel}`;
}

export async function spotlightRuntimeWindow(window: RuntimeWindowRow | null) {
  if (!window) {
    return;
  }

  if (window.state === "Minimized") {
    restoreWindowById(window.id);
  }

  focusWindowById(window.id);
}

export async function terminateRuntimeProcess(process: RuntimeProcessRow | null) {
  if (!process || !process.isKillable) {
    return;
  }

  terminateProcessById(process.id);
}

export async function handoffRuntimeTargetToTerminal(target: {
  process: RuntimeProcessRow | null;
  window: RuntimeWindowRow | null;
}) {
  const command = target.window ? `focus ${target.window.id}` : target.process ? `kill ${target.process.id}` : "sysinfo";

  return openTerminalWithCommand(command, {
    execute: false,
    source: "System Info target handoff",
  });
}

function buildIncidentSnapshotBody(
  context: RuntimeActionContext,
  diagnostic: RuntimeDiagnostic | null,
  target: { process: RuntimeProcessRow | null; window: RuntimeWindowRow | null },
) {
  return [
    `Runtime health: ${context.content.runtimeHealth.label} (${context.content.runtimeHealth.score}/100)`,
    `Boot progress: ${context.bootProgress}%`,
    `Focused window: ${context.content.headlineStats.focusedWindowTitle}`,
    `Running processes: ${context.content.headlineStats.processCount}`,
    `Open windows: ${context.content.headlineStats.windowCount}`,
    "",
    "Selected target",
    `- Process: ${formatProcessDescriptor(target.process)}`,
    `- Window: ${formatWindowDescriptor(target.window)}`,
    "",
    diagnostic
      ? [
          "Primary diagnostic",
          `- ${diagnostic.title} [${diagnostic.severity}]`,
          `- ${diagnostic.detail}`,
          `- Recommended action: ${diagnostic.recommendation}`,
          "",
        ].join("\n")
      : "",
    "Meters",
    ...context.content.meters.map((meter) => `- ${meter.label}: ${meter.displayValue} :: ${meter.note}`),
    "",
    "Other diagnostics",
    ...context.content.diagnostics.map((entry) => `- ${entry.title} [${entry.severity}] :: ${entry.detail}`),
    "",
    "Window distribution",
    ...context.content.windowDistribution.map((entry) => `- ${entry.label}: ${entry.value}`),
    "",
    "System notes",
    ...context.content.systemNotes.map((note) => `- ${note}`),
    context.note ? "Operator note" : "",
    context.note ? context.note : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function exportIncidentSnapshotToNotes(
  context: RuntimeActionContext,
  diagnostic: RuntimeDiagnostic | null,
  target: { process: RuntimeProcessRow | null; window: RuntimeWindowRow | null },
) {
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return openNotesWithRequest({
    mode: "create",
    title: `Incident Snapshot - ${timestamp}`,
    body: buildIncidentSnapshotBody(context, diagnostic, target),
    tags: ["system-info", "runtime", "incident"],
    pinned: diagnostic?.severity === "critical",
    selectAfterWrite: true,
    source: "System Info incident snapshot",
  });
}
