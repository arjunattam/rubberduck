import { listener as pullListener } from "./pull";

export const getListener = () => {
  return pullListener;
};

// export const getReader = () => {
//   return getHelper(blobReadXY, pullReadXY);
// };
