import type { DesktopBounds, WindowFrame, WindowInstance, WindowPosition, WindowSize } from "@/entities/window";

type SplitViewFrameInput = {
  ratio: number;
  leftMinWidth: number;
  rightMinWidth: number;
};

export function getTopVisibleWindowId(windows: WindowInstance[]) {
  return [...windows]
    .filter((window) => !window.isMinimized)
    .sort((left, right) => right.zIndex - left.zIndex)[0]?.id ?? null;
}

export function getWindowFrameFromBounds(bounds: DesktopBounds): WindowFrame {
  return {
    position: {
      x: bounds.insetLeft,
      y: bounds.insetTop,
    },
    size: {
      width: Math.max(320, bounds.width - bounds.insetLeft - bounds.insetRight),
      height: Math.max(240, bounds.height - bounds.insetTop - bounds.insetBottom),
    },
  };
}

export function getFullscreenFrame(bounds: Pick<DesktopBounds, "width" | "height">): WindowFrame {
  return {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: Math.max(320, bounds.width),
      height: Math.max(240, bounds.height),
    },
  };
}

export function clampSplitViewRatio(
  bounds: Pick<DesktopBounds, "width">,
  input: SplitViewFrameInput,
) {
  const totalWidth = Math.max(320, bounds.width);
  const minLeftRatio = Math.min(0.9, input.leftMinWidth / totalWidth);
  const maxLeftRatio = Math.max(0.1, 1 - input.rightMinWidth / totalWidth);

  return Math.min(Math.max(input.ratio, minLeftRatio), maxLeftRatio);
}

export function getSplitViewFrames(
  bounds: Pick<DesktopBounds, "width" | "height">,
  input: SplitViewFrameInput,
): { left: WindowFrame; right: WindowFrame; ratio: number } {
  const ratio = clampSplitViewRatio(bounds, input);
  const totalWidth = Math.max(320, bounds.width);
  const totalHeight = Math.max(240, bounds.height);
  const leftWidth = Math.round(totalWidth * ratio);
  const rightWidth = totalWidth - leftWidth;

  return {
    ratio,
    left: {
      position: { x: 0, y: 0 },
      size: {
        width: leftWidth,
        height: totalHeight,
      },
    },
    right: {
      position: { x: leftWidth, y: 0 },
      size: {
        width: rightWidth,
        height: totalHeight,
      },
    },
  };
}

export function resolveWindowSize(
  size: WindowSize,
  minSize: WindowSize,
  bounds?: DesktopBounds,
): WindowSize {
  if (!bounds) {
    return size;
  }

  const availableWidth = Math.max(320, bounds.width - bounds.insetLeft - bounds.insetRight);
  const availableHeight = Math.max(240, bounds.height - bounds.insetTop - bounds.insetBottom);

  return {
    width: Math.min(Math.max(size.width, minSize.width), availableWidth),
    height: Math.min(Math.max(size.height, minSize.height), availableHeight),
  };
}

export function clampWindowPosition(
  position: WindowPosition,
  size: WindowSize,
  bounds: DesktopBounds,
): WindowPosition {
  const maxX = Math.max(bounds.insetLeft, bounds.width - bounds.insetRight - size.width);
  const maxY = Math.max(bounds.insetTop, bounds.height - bounds.insetBottom - size.height);

  return {
    x: Math.min(Math.max(position.x, bounds.insetLeft), maxX),
    y: Math.min(Math.max(position.y, bounds.insetTop), maxY),
  };
}

export function buildWindowRecord(windows: WindowInstance[]): Record<string, WindowInstance> {
  return Object.fromEntries(windows.map((w) => [w.id, w]));
}

export function replaceWindow(
  windows: WindowInstance[],
  windowId: string,
  updater: (window: WindowInstance) => WindowInstance,
) {
  return windows.map((window) => (window.id === windowId ? updater(window) : window));
}
