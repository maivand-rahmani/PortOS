import type { DesktopBounds, WindowFrame, WindowPosition } from "@/entities/window";

/**
 * Snap zone identifiers for edge and corner snapping.
 *
 * - "left" / "right": half-screen tiling
 * - "top": maximize
 * - "top-left" / "top-right" / "bottom-left" / "bottom-right": quarter tiling
 */
export type WindowSnapZone =
  | "left"
  | "right"
  | "top"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/** Pixel threshold from screen edge to trigger snap detection. */
const SNAP_EDGE_THRESHOLD = 8;

/** Pixel size of corner hot-zones measured from each edge. */
const SNAP_CORNER_SIZE = 60;

/**
 * Detect which snap zone (if any) the pointer is currently in.
 *
 * Corners take priority over edges. Returns `null` when the pointer
 * is not within any snap zone.
 */
export function detectSnapZone(
  pointer: WindowPosition,
  bounds: DesktopBounds,
): WindowSnapZone | null {
  const nearLeft = pointer.x <= bounds.insetLeft + SNAP_EDGE_THRESHOLD;
  const nearRight =
    pointer.x >= bounds.width - bounds.insetRight - SNAP_EDGE_THRESHOLD;
  const nearTop = pointer.y <= bounds.insetTop + SNAP_EDGE_THRESHOLD;
  const nearBottom =
    pointer.y >= bounds.height - bounds.insetBottom - SNAP_EDGE_THRESHOLD;

  const inCornerTop = pointer.y <= bounds.insetTop + SNAP_CORNER_SIZE;
  const inCornerBottom =
    pointer.y >= bounds.height - bounds.insetBottom - SNAP_CORNER_SIZE;
  const inCornerLeft = pointer.x <= bounds.insetLeft + SNAP_CORNER_SIZE;
  const inCornerRight =
    pointer.x >= bounds.width - bounds.insetRight - SNAP_CORNER_SIZE;

  // Corner zones (check first — they overlay edge zones)
  if (nearLeft && inCornerTop) return "top-left";
  if (nearRight && inCornerTop) return "top-right";
  if (nearLeft && inCornerBottom) return "bottom-left";
  if (nearRight && inCornerBottom) return "bottom-right";

  // Edge zones
  if (nearTop) return "top";
  if (nearLeft) return "left";
  if (nearRight) return "right";

  return null;
}

/**
 * Compute the window frame for a given snap zone.
 *
 * The returned frame fills the appropriate portion of the
 * available desktop area (respecting insets for menu bar, dock, etc.).
 */
export function getSnapFrame(
  zone: WindowSnapZone,
  bounds: DesktopBounds,
): WindowFrame {
  const left = bounds.insetLeft;
  const top = bounds.insetTop;
  const availableWidth = bounds.width - bounds.insetLeft - bounds.insetRight;
  const availableHeight = bounds.height - bounds.insetTop - bounds.insetBottom;
  const halfWidth = Math.floor(availableWidth / 2);
  const halfHeight = Math.floor(availableHeight / 2);

  switch (zone) {
    case "left":
      return {
        position: { x: left, y: top },
        size: { width: halfWidth, height: availableHeight },
      };
    case "right":
      return {
        position: { x: left + halfWidth, y: top },
        size: { width: availableWidth - halfWidth, height: availableHeight },
      };
    case "top":
      return {
        position: { x: left, y: top },
        size: { width: availableWidth, height: availableHeight },
      };
    case "top-left":
      return {
        position: { x: left, y: top },
        size: { width: halfWidth, height: halfHeight },
      };
    case "top-right":
      return {
        position: { x: left + halfWidth, y: top },
        size: { width: availableWidth - halfWidth, height: halfHeight },
      };
    case "bottom-left":
      return {
        position: { x: left, y: top + halfHeight },
        size: { width: halfWidth, height: availableHeight - halfHeight },
      };
    case "bottom-right":
      return {
        position: { x: left + halfWidth, y: top + halfHeight },
        size: {
          width: availableWidth - halfWidth,
          height: availableHeight - halfHeight,
        },
      };
  }
}
