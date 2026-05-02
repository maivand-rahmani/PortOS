import type { WindowPosition } from "@/entities/window";

// ── Grid Cell Dimensions ──────────────────────────────────────

/** Grid cell size (width and height of one icon slot). */
export type GridCellSize = { width: number; height: number };

/** Grid spacing (x and y distance between cell centers). */
export type GridSpacing = { x: number; y: number };

/** Top-left origin of the icon grid area in pixel space. */
export type GridOrigin = { x: number; y: number };

/** Cell coordinate in the icon grid (row, col). */
export type GridCell = { row: number; col: number };

// ── Snap / Convert ────────────────────────────────────────────

/**
 * Snap a pixel position to the nearest grid cell.
 * macOS style: free movement during drag, snap only on drop.
 */
export function snapToGrid(
  position: WindowPosition,
  cellSize: GridCellSize,
  spacing: GridSpacing,
  origin: GridOrigin,
): WindowPosition {
  const col = Math.max(0, Math.round((position.x - origin.x) / spacing.x));
  const row = Math.max(0, Math.round((position.y - origin.y) / spacing.y));

  return {
    x: origin.x + col * spacing.x,
    y: origin.y + row * spacing.y,
  };
}

/**
 * Convert a pixel position to grid cell (row, col) coordinates.
 */
export function positionToCell(
  position: WindowPosition,
  origin: GridOrigin,
  spacing: GridSpacing,
): GridCell {
  return {
    row: Math.max(0, Math.round((position.y - origin.y) / spacing.y)),
    col: Math.max(0, Math.round((position.x - origin.x) / spacing.x)),
  };
}

/**
 * Convert a grid cell (row, col) to pixel position.
 */
export function cellToPosition(
  cell: GridCell,
  origin: GridOrigin,
  spacing: GridSpacing,
): WindowPosition {
  return {
    x: origin.x + cell.col * spacing.x,
    y: origin.y + cell.row * spacing.y,
  };
}

// ── Grid Layout ───────────────────────────────────────────────

/**
 * Compute a full right-aligned grid layout (macOS style).
 *
 * Items fill top-to-bottom within each column, then right-to-left across columns.
 * Returns a map of itemId → snapped pixel position.
 */
export function computeGridLayout(
  itemIds: string[],
  origin: GridOrigin,
  rows: number,
  cellSize: GridCellSize,
  spacing: GridSpacing,
): Record<string, WindowPosition> {
  const layout: Record<string, WindowPosition> = {};
  const totalCols = Math.max(1, Math.ceil(itemIds.length / rows));

  for (let i = 0; i < itemIds.length; i++) {
    const row = i % rows;
    const colFromRight = Math.floor(i / rows);
    const colFromLeft = totalCols - 1 - colFromRight;

    layout[itemIds[i]] = {
      x: origin.x + colFromLeft * spacing.x,
      y: origin.y + row * spacing.y,
    };
  }

  return layout;
}

// ── Occupancy ─────────────────────────────────────────────────

/**
 * Derive the set of occupied cell keys ("row,col") from current icon positions.
 */
export function getOccupiedCells(
  positions: Record<string, WindowPosition>,
  origin: GridOrigin,
  spacing: GridSpacing,
): Set<string> {
  const occupied = new Set<string>();

  for (const _id of Object.keys(positions)) {
    const pos = positions[_id];
    const cell = positionToCell(pos, origin, spacing);
    occupied.add(`${cell.row},${cell.col}`);
  }

  return occupied;
}

// ── Collision Resolution ──────────────────────────────────────

/**
 * Find the nearest free cell when the desired cell is occupied.
 *
 * Expands in a spiral (ring by ring) around the desired cell, searching
 * outward until an unoccupied cell within bounds is found.
 */
export function resolveCollision(
  desiredCell: GridCell,
  occupiedCells: Set<string>,
  maxRows: number,
  maxCols: number,
): GridCell {
  const key = (r: number, c: number) => `${r},${c}`;

  if (!occupiedCells.has(key(desiredCell.row, desiredCell.col))) {
    return desiredCell;
  }

  const maxRadius = Math.max(maxRows, maxCols);

  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const onBoundary =
          Math.abs(dr) === radius || Math.abs(dc) === radius;
        if (!onBoundary) continue;

        const r = desiredCell.row + dr;
        const c = desiredCell.col + dc;

        if (r < 0 || r >= maxRows || c < 0 || c >= maxCols) continue;
        if (!occupiedCells.has(key(r, c))) {
          return { row: r, col: c };
        }
      }
    }
  }

  // Every cell within range is occupied — return the original
  return desiredCell;
}

// ── Sort ──────────────────────────────────────────────────────

/** Metadata lookup for sortItemByCleanUpMode. */
export type SortItemMeta = {
  name: string;
  type: string;
  extension?: string;
  updatedAt?: string;
  isDirectory?: boolean;
};

/**
 * Sort item IDs by macOS Clean Up mode.
 *
 * - "by-order": preserve current order (identity)
 * - "by-name": alphabetical (localeCompare)
 * - "by-type": apps first, then directories, then files by extension
 * - "by-date": newest first (updatedAt descending)
 */
export function sortItemsByCleanUpMode(
  itemIds: string[],
  mode: "by-order" | "by-name" | "by-type" | "by-date",
  metadata: Record<string, SortItemMeta>,
): string[] {
  if (mode === "by-order") {
    return [...itemIds];
  }

  const sorted = [...itemIds];

  if (mode === "by-name") {
    sorted.sort((a, b) => {
      const nameA = metadata[a]?.name ?? a;
      const nameB = metadata[b]?.name ?? b;
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
    return sorted;
  }

  if (mode === "by-type") {
    sorted.sort((a, b) => {
      const aMeta = metadata[a];
      const bMeta = metadata[b];

      const aGroup = getTypeGroup(aMeta);
      const bGroup = getTypeGroup(bMeta);

      if (aGroup !== bGroup) return aGroup - bGroup;

      // Same group — sort by extension, then by name
      const aExt = aMeta?.extension ?? "";
      const bExt = bMeta?.extension ?? "";
      const extCmp = aExt.localeCompare(bExt, undefined, { sensitivity: "base" });
      if (extCmp !== 0) return extCmp;

      const nameA = aMeta?.name ?? a;
      const nameB = bMeta?.name ?? b;
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
    return sorted;
  }

  sorted.sort((a, b) => {
    const dateA = metadata[a]?.updatedAt;
    const dateB = metadata[b]?.updatedAt;

    // Items without a date sort last
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    const aTime = new Date(dateA).getTime();
    const bTime = new Date(dateB).getTime();

    // Newest first (descending)
    return bTime - aTime;
  });

  return sorted;
}

// ── Helpers ───────────────────────────────────────────────────

/** Assign a sort group to a metadata entry for type-based ordering. */
function getTypeGroup(meta: SortItemMeta | undefined): number {
  if (!meta) return 3;
  if (meta.type === "app") return 0;
  if (meta.isDirectory) return 1;
  return 2;
}
