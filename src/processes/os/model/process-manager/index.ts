import type { AppConfig } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";

export type ProcessManagerState = {
  processes: ProcessInstance[];
};

export const processManagerInitialState: ProcessManagerState = {
  processes: [],
};

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

  return {
    state: {
      processes: [...state.processes, process],
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
  return {
    processes: state.processes.map((process) =>
      process.id === input.processId
        ? {
            ...process,
            windowId: input.windowId,
          }
        : process,
    ),
  };
}

export function stopProcessModel(
  state: ProcessManagerState,
  processId: string,
): ProcessManagerState {
  return {
    processes: state.processes.filter((process) => process.id !== processId),
  };
}
