import { listener as pullListener } from "./pull";

export const getListener = () => {
  return pullListener;
};
