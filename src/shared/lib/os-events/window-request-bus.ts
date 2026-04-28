type TargetedWindowRequest = {
  targetWindowId?: string;
};

const pendingRequests = new Map<string, unknown[]>();

export function dispatchWindowRequest<T>(
  storageKey: string,
  eventName: string,
  detail: T,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const existing = pendingRequests.get(storageKey) ?? [];
  existing.push(detail);
  pendingRequests.set(storageKey, existing);
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

  const queue = pendingRequests.get(storageKey);
  if (!queue || queue.length === 0) return null;
  const pending = queue.shift()!;
  if (queue.length === 0) pendingRequests.delete(storageKey);

  const parsed = pending as T;

  if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
    return null;
  }

  if (parsed.targetWindowId && !targetWindowId) {
    return null;
  }

  return parsed;
}

export function consumeUntargetedWindowRequest<T>(storageKey: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const queue = pendingRequests.get(storageKey);
  if (!queue || queue.length === 0) return null;
  const pending = queue.shift()!;
  if (queue.length === 0) pendingRequests.delete(storageKey);

  return pending as T;
}
