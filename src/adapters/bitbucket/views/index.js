import { listener as pullListener, readXY as pullReadXY } from "./pull";

export const getListener = () => {
  return pullListener;
};

export const getReader = () => {
  return pullReadXY;
};
