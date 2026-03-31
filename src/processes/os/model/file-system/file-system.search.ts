import type {
  FileSearchResult,
  FileSystemNode,
  AbsolutePath,
} from "@/entities/file-system";

import type { FileSystemManagerState } from "./file-system.types";
import { getNodePath } from "./file-system.path";

// ── Search by Name / Extension ──────────────────────────

export function searchNodesModel(
  state: FileSystemManagerState,
  query: string,
): FileSearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();
  const results: FileSearchResult[] = [];

  for (const node of state.fsNodes) {
    if (node.isHidden) {
      continue;
    }

    const nameLower = node.name.toLowerCase();
    const path = getNodePath(node.id, state.fsNodeMap);

    // Name match
    if (nameLower.includes(normalizedQuery)) {
      results.push({
        node,
        path: path as AbsolutePath,
        matchType: "name",
      });

      continue;
    }

    // Extension match (for files)
    if (
      node.type === "file" &&
      node.extension.toLowerCase() === normalizedQuery
    ) {
      results.push({
        node,
        path: path as AbsolutePath,
        matchType: "extension",
      });
    }
  }

  return results;
}

// ── Content Search (called with preloaded content) ──────

export function searchContentModel(
  state: FileSystemManagerState,
  query: string,
  contentMap: Record<string, string>,
): FileSearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();
  const results: FileSearchResult[] = [];

  for (const node of state.fsNodes) {
    if (node.type !== "file" || node.isHidden) {
      continue;
    }

    const content = contentMap[node.id];

    if (!content) {
      continue;
    }

    const contentLower = content.toLowerCase();
    const matchIndex = contentLower.indexOf(normalizedQuery);

    if (matchIndex === -1) {
      continue;
    }

    const snippetStart = Math.max(0, matchIndex - 40);
    const snippetEnd = Math.min(
      content.length,
      matchIndex + normalizedQuery.length + 40,
    );
    const snippet = (snippetStart > 0 ? "..." : "") +
      content.slice(snippetStart, snippetEnd) +
      (snippetEnd < content.length ? "..." : "");

    const path = getNodePath(node.id, state.fsNodeMap);

    results.push({
      node,
      path: path as AbsolutePath,
      matchType: "content",
      snippet,
    });
  }

  return results;
}

// ── Update Search State ─────────────────────────────────

export function setSearchQueryModel(
  state: FileSystemManagerState,
  query: string,
): FileSystemManagerState {
  return {
    ...state,
    fsSearchQuery: query,
  };
}

export function setSearchResultsModel(
  state: FileSystemManagerState,
  results: FileSearchResult[],
): FileSystemManagerState {
  return {
    ...state,
    fsSearchResults: results,
  };
}

export function clearSearchModel(
  state: FileSystemManagerState,
): FileSystemManagerState {
  return {
    ...state,
    fsSearchQuery: "",
    fsSearchResults: [],
  };
}
