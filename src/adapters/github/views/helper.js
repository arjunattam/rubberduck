import { listener as blobListener, readXY as blobReadXY } from "./blob";
import { listener as pullListener, readXY as pullReadXY } from "./pull";

const getHelper = (blobMethod, pullMethod) => {
  const isFileView = window.location.href.indexOf("blob") >= 0;
  const isPRView = window.location.href.indexOf("pull") >= 0;
  const isCommitView = window.location.href.indexOf("commit") >= 0;
  const isCompareView = window.location.href.indexOf("compare") >= 0;

  if (isFileView) {
    return blobMethod;
  } else if (isPRView || isCommitView || isCompareView) {
    return pullMethod;
  }

  return null;
};

export const getListener = () => {
  return getHelper(blobListener, pullListener);
};

export const getReader = () => {
  return getHelper(blobReadXY, pullReadXY);
};
