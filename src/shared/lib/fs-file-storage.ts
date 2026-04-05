import type { AbsolutePath } from "@/entities/file-system";

import * as idb from "./idb-storage";

export async function readFsJsonAtPath<T>(path: AbsolutePath): Promise<T | null> {
  return idb.readJsonFile<T>(path);
}
