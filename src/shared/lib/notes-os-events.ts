import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

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

  dispatchWindowRequest(
    NOTES_EXTERNAL_REQUEST_STORAGE_KEY,
    NOTES_EXTERNAL_REQUEST_EVENT,
    detail,
  );
}

export function consumeNotesExternalRequest(targetWindowId?: string) {
  return consumeWindowRequest<NotesExternalRequestDetail>(
    NOTES_EXTERNAL_REQUEST_STORAGE_KEY,
    targetWindowId,
  );
}
