import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

export const SYSTEM_INFO_EXTERNAL_REQUEST_EVENT = "portos:system-info-external-request";
const SYSTEM_INFO_EXTERNAL_REQUEST_STORAGE_KEY = "portos-system-info-external-request";

export type SystemInfoExternalSection = "diagnostics" | "overview" | "processes" | "windows";

export type SystemInfoExternalRequestDetail = {
  section?: SystemInfoExternalSection;
  processId?: string;
  windowId?: string;
  appId?: string;
  openIncidentSnapshot?: boolean;
  note?: string;
  source?: string;
  targetWindowId?: string;
};

export function dispatchSystemInfoExternalRequest(detail: SystemInfoExternalRequestDetail) {
  if (typeof window === "undefined") {
    return;
  }

  dispatchWindowRequest(
    SYSTEM_INFO_EXTERNAL_REQUEST_STORAGE_KEY,
    SYSTEM_INFO_EXTERNAL_REQUEST_EVENT,
    detail,
  );
}

export function consumeSystemInfoExternalRequest(targetWindowId?: string) {
  return consumeWindowRequest<SystemInfoExternalRequestDetail>(
    SYSTEM_INFO_EXTERNAL_REQUEST_STORAGE_KEY,
    targetWindowId,
  );
}
