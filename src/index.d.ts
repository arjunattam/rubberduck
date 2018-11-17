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
  sha: string;
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
