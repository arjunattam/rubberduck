export enum ViewType {
  File = "file",
  Compare = "compare",
  Commit = "commit",
  PR = "pull"
}

export interface RemoteView {
  type: ViewType;
  isPrivate: boolean;
  head: RepoReference;
  base?: RepoReference; // for compare/commit/pull views
  filePath?: string; // for file views
  pullRequestId?: string; // for pull views
}

export abstract class BasePathAdapter {
  abstract getViewInfo(): Promise<RemoteView | undefined>;

  abstract isSameSessionPath(prevDetails, details): boolean;

  abstract hasChangedPath(prevDetails, details): boolean;

  abstract constructFilePath(path, username, reponame, branch): string;
}
