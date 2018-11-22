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

interface Message {
  id: string;
  type: RequestType;
  payload: object;
}

const enum RequestType {
  Info = "INFO",
  CloneCheckout = "CLONE_AND_CHECKOUT",
  Initialize = "INITIALIZE",
  Hover = "HOVER",
  Definition = "DEFINITION",
  References = "REFERENCES",
  FileContents = "FILE_CONTENTS",
  Exit = "EXIT"
}
