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
  windowId: string | null;
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
  isFocused: boolean;
};

export type RuntimeDistributionPoint = {
  label: string;
  value: number;
};

export type RuntimeDiagnosticSeverity = "critical" | "warning" | "healthy";

export type RuntimeDiagnostic = {
  id: string;
  severity: RuntimeDiagnosticSeverity;
  title: string;
  detail: string;
  recommendation: string;
};

export type RuntimeHeadlineStats = {
  processCount: number;
  windowCount: number;
  visibleWindowCount: number;
  maximizedWindowCount: number;
  focusedWindowTitle: string;
  activeAppCount: number;
};

export type RuntimeHealthSummary = {
  score: number;
  label: string;
  note: string;
};

export type SystemInfoContent = {
  editionLabel: string;
  meters: RuntimeMeter[];
  headlineStats: RuntimeHeadlineStats;
  processRows: RuntimeProcessRow[];
  windowRows: RuntimeWindowRow[];
  cpuTrend: RuntimeTrendPoint[];
  memoryTrend: RuntimeTrendPoint[];
  windowDistribution: RuntimeDistributionPoint[];
  diagnostics: RuntimeDiagnostic[];
  runtimeHealth: RuntimeHealthSummary;
  systemNotes: string[];
};

export type SelectedRuntimeTarget = {
  process: RuntimeProcessRow | null;
  window: RuntimeWindowRow | null;
};
