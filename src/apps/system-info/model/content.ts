import type { AppConfig } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { WindowInstance } from "@/entities/window";

import type {
  RuntimeDiagnostic,
  RuntimeDistributionPoint,
  RuntimeMeter,
  RuntimeProcessRow,
  RuntimeTrendPoint,
  RuntimeWindowRow,
  SystemInfoContent,
} from "./types";

type BuildMetricsInput = {
  apps: AppConfig[];
  processes: ProcessInstance[];
  windows: WindowInstance[];
  windowRecord?: Record<string, WindowInstance>;
  activeWindowId: string | null;
  bootProgress: number;
};

function clampMetric(value: number) {
  return Math.max(6, Math.min(100, Math.round(value)));
}

function formatDuration(startedAt: number, now: number) {
  const deltaSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = Math.floor(deltaSeconds / 60);
  const seconds = deltaSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

function formatStartedLabel(startedAt: number) {
  return new Date(startedAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildProcessRows(input: BuildMetricsInput, now: number): RuntimeProcessRow[] {
  const runningProcesses = input.processes.filter((process) => process.status === "running");

  return runningProcesses
    .map((process) => {
      const linkedWindow = input.windows.find((window) => window.processId === process.id) ?? null;

      return {
        id: process.id,
        name: process.name,
        appId: process.appId,
        windowId: linkedWindow?.id ?? null,
        windowTitle: linkedWindow?.title ?? "No Window",
        windowState: linkedWindow
          ? linkedWindow.isMaximized
            ? "Maximized"
            : linkedWindow.isMinimized
              ? "Minimized"
              : "Windowed"
          : "Headless",
        uptimeLabel: formatDuration(process.startedAt, now),
        startedLabel: formatStartedLabel(process.startedAt),
        isFocused: linkedWindow?.id === input.activeWindowId,
        isKillable: process.appId !== "system-info",
      };
    })
    .sort((left, right) => Number(right.isFocused) - Number(left.isFocused) || left.name.localeCompare(right.name));
}

function buildWindowRows(input: BuildMetricsInput): RuntimeWindowRow[] {
  return [...input.windows]
    .sort((left, right) => right.zIndex - left.zIndex)
    .map((window) => ({
      id: window.id,
      title: window.title,
      appId: window.appId,
      processId: window.processId,
      zIndex: window.zIndex,
      state: window.isMaximized ? "Maximized" : window.isMinimized ? "Minimized" : "Visible",
      sizeLabel: `${window.size.width}x${window.size.height}`,
      isFocused: window.id === input.activeWindowId,
    }));
}

function buildDistribution(input: BuildMetricsInput): RuntimeDistributionPoint[] {
  const visibleWindows = input.windows.filter((window) => !window.isMinimized).length;
  const minimizedWindows = input.windows.filter((window) => window.isMinimized).length;
  const maximizedWindows = input.windows.filter((window) => window.isMaximized).length;

  return [
    { label: "Visible", value: visibleWindows },
    { label: "Minimized", value: minimizedWindows },
    { label: "Maximized", value: maximizedWindows },
  ].filter((item) => item.value > 0);
}

function buildTrend(points: number[]): RuntimeTrendPoint[] {
  return points.map((value, index) => ({
    label: `T${index + 1}`,
    value,
  }));
}

function buildDiagnostics(input: BuildMetricsInput, meters: RuntimeMeter[]): RuntimeDiagnostic[] {
  const runningProcesses = input.processes.filter((process) => process.status === "running");
  const visibleWindows = input.windows.filter((window) => !window.isMinimized);
  const minimizedWindows = input.windows.filter((window) => window.isMinimized);
  const maximizedWindows = input.windows.filter((window) => window.isMaximized);
  const duplicateAppWindows = Array.from(
    runningProcesses.reduce<Map<string, number>>((accumulator, process) => {
      accumulator.set(process.appId, (accumulator.get(process.appId) ?? 0) + 1);
      return accumulator;
    }, new Map()),
  ).filter(([, count]) => count > 1);

  const diagnostics: RuntimeDiagnostic[] = [];
  const cpuMeter = meters.find((meter) => meter.label === "CPU") ?? meters[0];
  const memoryMeter = meters.find((meter) => meter.label === "RAM") ?? meters[1] ?? meters[0];

  if (cpuMeter.value >= 78) {
    diagnostics.push({
      id: "cpu-pressure",
      severity: "critical",
      title: "Runtime load is elevated",
      detail: `${cpuMeter.displayValue} estimated CPU load with ${runningProcesses.length} active processes and ${visibleWindows.length} visible windows.`,
      recommendation: "Focus or terminate the noisiest process, or collapse background windows before launching more apps.",
    });
  }

  if (memoryMeter.value >= 72) {
    diagnostics.push({
      id: "memory-pressure",
      severity: cpuMeter.value >= 78 ? "critical" : "warning",
      title: "Window memory pressure is building",
      detail: `${memoryMeter.displayValue} estimated RAM usage with ${maximizedWindows.length} maximized layouts currently active.`,
      recommendation: "Restore one or more maximized windows or close stale sessions to ease layout pressure.",
    });
  }

  if (!input.activeWindowId && visibleWindows.length > 0) {
    diagnostics.push({
      id: "focus-gap",
      severity: "warning",
      title: "No active window is currently focused",
      detail: `${visibleWindows.length} windows are available but none is marked as the frontmost target.`,
      recommendation: "Spotlight a window to restore a clear operator target before taking action.",
    });
  }

  if (minimizedWindows.length >= 2) {
    diagnostics.push({
      id: "hidden-backlog",
      severity: "warning",
      title: "Background backlog detected",
      detail: `${minimizedWindows.length} windows are minimized and may hide stale work or orphaned sessions.`,
      recommendation: "Review minimized windows from the ledger and either restore or terminate the ones you no longer need.",
    });
  }

  if (duplicateAppWindows.length > 0) {
    const [appId, count] = duplicateAppWindows[0];
    diagnostics.push({
      id: "parallel-sessions",
      severity: count >= 3 ? "warning" : "healthy",
      title: "Parallel app sessions detected",
      detail: `${appId} currently owns ${count} live processes inside the runtime.`,
      recommendation: "Keep the extra sessions if intentional, otherwise consolidate them to reduce process churn.",
    });
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      id: "runtime-healthy",
      severity: "healthy",
      title: "Runtime looks stable",
      detail: `Boot progress is ${input.bootProgress}% with ${runningProcesses.length} running processes and ${visibleWindows.length} visible windows.`,
      recommendation: "Capture a snapshot in Notes if you want to preserve the current stable baseline.",
    });
  }

  return diagnostics;
}

function buildRuntimeHealth(diagnostics: RuntimeDiagnostic[]) {
  const score = diagnostics.reduce((current, diagnostic) => {
    if (diagnostic.severity === "critical") {
      return current - 24;
    }

    if (diagnostic.severity === "warning") {
      return current - 12;
    }

    return current + 4;
  }, 88);
  const clamped = Math.max(18, Math.min(100, score));

  if (clamped >= 82) {
    return {
      score: clamped,
      label: "Stable",
      note: "No urgent operator action is recommended right now.",
    };
  }

  if (clamped >= 58) {
    return {
      score: clamped,
      label: "Watch",
      note: "A few signals need operator attention before the session gets noisy.",
    };
  }

  return {
    score: clamped,
    label: "Incident",
    note: "The runtime has enough pressure to justify a snapshot and targeted cleanup.",
  };
}

export function buildSystemInfoContent(input: BuildMetricsInput): SystemInfoContent {
  const now = Date.now();
  const runningProcesses = input.processes.filter((process) => process.status === "running");
  const visibleWindows = input.windows.filter((window) => !window.isMinimized);
  const maximizedWindows = input.windows.filter((window) => window.isMaximized);
  const focusedWindow = input.activeWindowId
    ? (input.windowRecord?.[input.activeWindowId] ?? input.windows.find((window) => window.id === input.activeWindowId) ?? null)
    : null;

  const cpuUsage = clampMetric(14 + runningProcesses.length * 11 + visibleWindows.length * 7);
  const memoryUsage = clampMetric(20 + input.windows.length * 9 + maximizedWindows.length * 10);
  const storageUsage = clampMetric(28 + input.apps.length * 4 + input.bootProgress / 5);

  const meters: RuntimeMeter[] = [
    {
      label: "CPU",
      value: cpuUsage,
      displayValue: `${cpuUsage}%`,
      note: `${runningProcesses.length} active processes feeding the current load estimate.`,
    },
    {
      label: "RAM",
      value: memoryUsage,
      displayValue: `${memoryUsage}%`,
      note: `${visibleWindows.length} visible windows and ${maximizedWindows.length} maximized layouts in memory.`,
    },
    {
      label: "STORAGE",
      value: storageUsage,
      displayValue: `${storageUsage}%`,
      note: `${input.apps.length} installed apps and boot index ${input.bootProgress}% currently tracked.`,
    },
  ];
  const processRows = buildProcessRows(input, now);
  const windowRows = buildWindowRows(input);
  const diagnostics = buildDiagnostics(input, meters);
  const runtimeHealth = buildRuntimeHealth(diagnostics);

  return {
    editionLabel: `Vol. 1 | Runtime Desk | ${new Date(now).toLocaleDateString("en-GB")}`,
    meters,
    headlineStats: {
      processCount: runningProcesses.length,
      windowCount: input.windows.length,
      visibleWindowCount: visibleWindows.length,
      maximizedWindowCount: maximizedWindows.length,
      focusedWindowTitle: focusedWindow?.title ?? "No Active Window",
      activeAppCount: new Set(runningProcesses.map((process) => process.appId)).size,
    },
    processRows,
    windowRows,
    cpuTrend: buildTrend([
      clampMetric(cpuUsage - 18),
      clampMetric(cpuUsage - 11),
      clampMetric(cpuUsage - 4),
      cpuUsage,
      clampMetric(cpuUsage - 7),
      clampMetric(cpuUsage + 3),
    ]),
    memoryTrend: buildTrend([
      clampMetric(memoryUsage - 12),
      clampMetric(memoryUsage - 8),
      memoryUsage,
      clampMetric(memoryUsage + 4),
      clampMetric(memoryUsage - 2),
      clampMetric(memoryUsage + 6),
    ]),
    windowDistribution: buildDistribution(input),
    diagnostics,
    runtimeHealth,
    systemNotes: [
      "Metrics are derived from the real PortOS runtime rather than host-machine telemetry.",
      "Diagnostics react to current window, process, and focus pressure inside the simulated OS.",
      "Incident snapshots can be exported into Notes or handed off to Terminal for follow-up actions.",
    ],
  };
}
