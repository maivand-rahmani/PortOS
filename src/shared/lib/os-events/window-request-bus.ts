type TargetedWindowRequest = {
  targetWindowId?: string;
};

const pendingRequests = new Map<string, unknown>();

export function dispatchWindowRequest<T>(
  storageKey: string,
  eventName: string,
  detail: T,
): void {
  if (typeof window === "undefined") {
    return;
  }

  pendingRequests.set(storageKey, detail);
  window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
}

export function clearWindowRequest(storageKey: string): void {
  pendingRequests.delete(storageKey);
}

export function consumeWindowRequest<T extends TargetedWindowRequest>(
  storageKey: string,
  targetWindowId?: string,
): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const pending = pendingRequests.get(storageKey);

  if (!pending) {
    return null;
  }

  const parsed = pending as T;

  if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
    return null;
  }

  if (parsed.targetWindowId && !targetWindowId) {
    return null;
  }

  pendingRequests.delete(storageKey);

  return parsed;
}

export function consumeUntargetedWindowRequest<T>(storageKey: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const pending = pendingRequests.get(storageKey);

  if (!pending) {
    return null;
  }

  pendingRequests.delete(storageKey);

  return pending as T;
}
