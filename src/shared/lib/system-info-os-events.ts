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

  window.localStorage.setItem(SYSTEM_INFO_EXTERNAL_REQUEST_STORAGE_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<SystemInfoExternalRequestDetail>(SYSTEM_INFO_EXTERNAL_REQUEST_EVENT, {
      detail,
    }),
  );
}

export function consumeSystemInfoExternalRequest(targetWindowId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SYSTEM_INFO_EXTERNAL_REQUEST_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as SystemInfoExternalRequestDetail;

    if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    if (parsed.targetWindowId && !targetWindowId) {
      return null;
    }

    window.localStorage.removeItem(SYSTEM_INFO_EXTERNAL_REQUEST_STORAGE_KEY);

    return parsed;
  } catch {
    return null;
  }
}
