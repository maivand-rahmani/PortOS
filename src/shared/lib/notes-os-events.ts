export const NOTES_EXTERNAL_REQUEST_EVENT = "portos:notes-external-request";
const NOTES_EXTERNAL_REQUEST_STORAGE_KEY = "portos-notes-external-request";

export type NotesExternalRequestMode = "create" | "upsert";

export type NotesExternalRequestDetail = {
  mode?: NotesExternalRequestMode;
  id?: string;
  title: string;
  body?: string;
  tags?: string[];
  pinned?: boolean;
  selectAfterWrite?: boolean;
  source?: string;
  targetWindowId?: string;
};

export function dispatchNotesExternalRequest(detail: NotesExternalRequestDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NOTES_EXTERNAL_REQUEST_STORAGE_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<NotesExternalRequestDetail>(NOTES_EXTERNAL_REQUEST_EVENT, {
      detail,
    }),
  );
}

export function consumeNotesExternalRequest(targetWindowId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(NOTES_EXTERNAL_REQUEST_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as NotesExternalRequestDetail;

    if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    if (parsed.targetWindowId && !targetWindowId) {
      return null;
    }

    window.localStorage.removeItem(NOTES_EXTERNAL_REQUEST_STORAGE_KEY);

    return parsed;
  } catch {
    return null;
  }
}
