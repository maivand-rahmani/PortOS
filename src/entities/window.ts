export type WindowPosition = {
  x: number;
  y: number;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type WindowInstance = {
  id: string;
  appId: string;
  processId: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
};
