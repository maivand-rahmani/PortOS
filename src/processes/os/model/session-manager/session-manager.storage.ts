import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs-paths";
import { readFsJsonAtPath } from "@/shared/lib/fs-file-storage";

import type { PersistedSessionState } from "./session-manager.types";

export async function loadPersistedSession(): Promise<PersistedSessionState | null> {
  return readFsJsonAtPath<PersistedSessionState>(PERSISTED_FILE_PATHS.sessionSnapshot);
}
