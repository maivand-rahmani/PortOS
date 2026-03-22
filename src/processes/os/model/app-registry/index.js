export const appRegistryInitialState = {
  apps: [],
  appMap: {},
};

export function createAppRegistryModel(overrides = {}) {
  return {
    ...appRegistryInitialState,
    ...overrides,
  };
}
