interface RepoReference {
  user: string;
  name: string;
  service: "github" | "bitbucket";
  sha: string;
  branch?: string;
}

// https://stackoverflow.com/a/50511773/1469222
const enum ViewType {
  File = "file",
  Compare = "compare",
  Commit = "commit",
  PR = "pull"
}

interface RemoteView {
  type: ViewType;
  isPrivate: boolean;
  head: RepoReference;
  base?: RepoReference; // For compare/commit/pull views
  filePath?: string; // For file views
  pullRequestId?: string; // For pull views
}

interface InitializeParams {
  organisation: string;
  name: string;
  service: "github" | "bitbucket";
  pull_request_id: string;
  type: "file" | "compare" | "commit" | "pull";
  head_sha: string;
  base_sha: string;
}

interface LanguageQueryParams {
  path: string;
  line: number;
  character: number;
}

interface HoverResult {
  name: string;
  signature: string;
  language: string;
  docstring: string; // base64
}

interface DefinitionResult {
  name: string;
  filePath: string;
  fileSha: string;
  docstring: string; // base64
  items: ResultItem[];
}

interface ResultItem {
  codeSnippet: string;
  lineNumber: number;
  startLineNumber: number;
}

interface UsageItem {
  filePath: string;
  fileSha: string;
  items: ResultItem[];
}

interface Location {
  path: string;
  range: Range;
}

interface Range {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  character: number;
}
