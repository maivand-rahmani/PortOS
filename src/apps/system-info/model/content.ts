import type { AppConfig } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { WindowInstance } from "@/entities/window";

export type RuntimeTrendPoint = {
  label: string;
  value: number;
};

export type RuntimeMeter = {
  label: string;
  value: number;
  displayValue: string;
  note: string;
};

export type RuntimeProcessRow = {
  id: string;
  name: string;
  appId: string;
  windowTitle: string;
  windowState: string;
  uptimeLabel: string;
  startedLabel: string;
  isFocused: boolean;
  isKillable: boolean;
};

export type RuntimeWindowRow = {
  id: string;
  title: string;
  appId: string;
  zIndex: number;
  state: string;
  sizeLabel: string;
  processId: string;
};

export type RuntimeDistributionPoint = {
  label: string;
  value: number;
};

type BuildMetricsInput = {
  apps: AppConfig[];
  processes: ProcessInstance[];
  windows: WindowInstance[];
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
  const count = Math.max(1, runningProcesses.length);

  return runningProcesses
    .map((process, index) => {
      const linkedWindow = input.windows.find((window) => window.processId === process.id) ?? null;

      return {
        id: process.id,
        name: process.name,
        appId: process.appId,
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
    }));
}

function buildDistribution(input: BuildMetricsInput) {
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

export function buildSystemInfoContent(input: BuildMetricsInput) {
  const now = Date.now();
  const runningProcesses = input.processes.filter((process) => process.status === "running");
  const visibleWindows = input.windows.filter((window) => !window.isMinimized);
  const maximizedWindows = input.windows.filter((window) => window.isMaximized);
  const focusedWindow = input.windows.find((window) => window.id === input.activeWindowId) ?? null;

  const cpuUsage = clampMetric(14 + runningProcesses.length * 11 + visibleWindows.length * 7);
  const memoryUsage = clampMetric(20 + input.windows.length * 9 + maximizedWindows.length * 10);
  const storageUsage = clampMetric(28 + input.apps.length * 4 + input.bootProgress / 5);

  const processRows = buildProcessRows(input, now);
  const windowRows = buildWindowRows(input);

  return {
    editionLabel: `Vol. 1 | Runtime Desk | ${new Date(now).toLocaleDateString("en-GB")}`,
    meters: [
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
    ] satisfies RuntimeMeter[],
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
    systemNotes: [
      "Metrics are derived from the real PortOS runtime rather than host-machine telemetry.",
      "Process controls terminate actual app processes inside the simulated OS runtime.",
      "Maximized windows increase visible memory pressure in this dashboard model.",
    ],
  };
}
