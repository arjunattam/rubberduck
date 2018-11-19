export abstract class BasePathAdapter {
  abstract getViewInfo(): Promise<RemoteView | undefined>;

  abstract constructFullPath(filePath: string, repo: RepoReference): string;

  hasViewChanged(previousView: RemoteView, newView: RemoteView) {
    if (isEmpty(previousView) && isEmpty(newView)) {
      // both empty
      return false;
    } else if (!isEmpty(previousView) && !isEmpty(newView)) {
      // both available
      const hasChangedType = previousView.type !== newView.type;
      const hasChangedHead = previousView.head.sha !== newView.head.sha;
      let hasChangedBase = true;

      if (previousView.base && newView.base) {
        // both are available
        hasChangedBase = previousView.base.sha !== newView.base.sha;
      } else if (!previousView.base && !newView.base) {
        // both are undefined
        hasChangedBase = false;
      }

      return hasChangedType || hasChangedBase || hasChangedHead;
    } else {
      return true;
    }
  }

  hasPathChanged(previousView, newView) {
    return previousView.filePath !== newView.filePath;
  }
}

const isEmpty = obj => Object.keys(obj).length === 0;
