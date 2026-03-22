export const processManagerInitialState = {
  processes: [],
  runningProcessIds: [],
};

export function createProcessManagerModel(overrides = {}) {
  return {
    ...processManagerInitialState,
    ...overrides,
  };
}
