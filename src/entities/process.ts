export type ProcessStatus = "running" | "terminated";

export type ProcessInstance = {
  id: string;
  appId: string;
  name: string;
  windowId: string | null;
  startedAt: number;
  status: ProcessStatus;
};
