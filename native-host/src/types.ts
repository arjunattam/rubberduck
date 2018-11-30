interface RepoPayload {
  user: string;
  name: string;
  service: string;
  sha: string;
  branch?: string;
}

interface LanguageQueryPayload {
  repo: RepoPayload;
  query: {
    path: string;
    line: number;
    character: number;
  };
}

interface FileContentsPayload {
  repo: RepoPayload;
  query: {
    path: string;
  };
}

interface GitClonePayload {
  repo: RepoPayload;
  cloneUrl: string;
}

interface Message {
  id: string;
  type: RequestType;
  payload: object;
}

const enum RequestType {
  Info = "INFO",
  GitCloneCheckout = "GIT_CLONE_AND_CHECKOUT",
  GitRemoveAll = "GIT_REMOVE_ALL",
  Initialize = "INITIALIZE",
  Hover = "HOVER",
  Definition = "DEFINITION",
  References = "REFERENCES",
  FileContents = "FILE_CONTENTS",
  Exit = "EXIT"
}
