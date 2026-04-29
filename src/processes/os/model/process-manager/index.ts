import type { AppConfig } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";

export type ProcessManagerState = {
  processes: ProcessInstance[];
  processRecord: Record<string, ProcessInstance>;
};

export const processManagerInitialState: ProcessManagerState = {
  processes: [],
  processRecord: {},
};

export function buildProcessRecord(
  processes: ProcessInstance[],
): Record<string, ProcessInstance> {
  return Object.fromEntries(processes.map((p) => [p.id, p]));
}

export function createProcessManagerModel(
  overrides: Partial<ProcessManagerState> = {},
): ProcessManagerState {
  return {
    ...processManagerInitialState,
    ...overrides,
  };
}

export function startProcessModel(
  state: ProcessManagerState,
  app: Pick<AppConfig, "id" | "name">,
) {
  const process: ProcessInstance = {
    id: crypto.randomUUID(),
    appId: app.id,
    name: app.name,
    windowId: null,
    startedAt: Date.now(),
    status: "running",
  };

  const nextProcesses = [...state.processes, process];

  return {
    state: {
      processes: nextProcesses,
      processRecord: buildProcessRecord(nextProcesses),
    },
    process,
  };
}

export function attachWindowToProcessModel(
  state: ProcessManagerState,
  input: {
    processId: string;
    windowId: string;
  },
): ProcessManagerState {
  const nextProcesses = state.processes.map((process) =>
    process.id === input.processId
      ? {
          ...process,
          windowId: input.windowId,
        }
      : process,
  );

  return {
    processes: nextProcesses,
    processRecord: buildProcessRecord(nextProcesses),
  };
}

export function stopProcessModel(
  state: ProcessManagerState,
  processId: string,
): ProcessManagerState {
  const nextProcesses = state.processes.filter((process) => process.id !== processId);

  return {
    processes: nextProcesses,
    processRecord: buildProcessRecord(nextProcesses),
  };
}
