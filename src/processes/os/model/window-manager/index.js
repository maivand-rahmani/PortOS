export const windowManagerInitialState = {
  windows: [],
  activeWindowId: null,
  nextZIndex: 1,
};

export function createWindowManagerModel(overrides = {}) {
  return {
    ...windowManagerInitialState,
    ...overrides,
  };
}
