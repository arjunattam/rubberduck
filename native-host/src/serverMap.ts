import { TypeScriptServer } from "./tsServer";
import { spawnServer } from "./tsServer/spawn";
import { log } from "./logger";

export class LangServersMap {
  serversMap = new Map<string, TypeScriptServer>();

  createServer(payload: RepoPayload) {
    const existingServer = this.fetchServer(payload);

    if (!!existingServer) {
      // We already have a server
      return existingServer;
    }

    const process = spawnServer();
    process.on("exit", code => this.handleExit(payload, code));
    process.on("error", error => this.handleError(payload, error));
    const tsServer = new TypeScriptServer(process);
    this.serversMap.set(this.getKey(payload), tsServer);
    return tsServer;
  }

  fetchServer(payload: RepoPayload) {
    return this.serversMap.get(this.getKey(payload));
  }

  killServer(payload: RepoPayload) {
    const server = this.fetchServer(payload);

    if (!!server) {
      server.kill();
      this.serversMap.delete(this.getKey(payload));
    }
  }

  info() {
    return [...this.serversMap.keys()];
  }

  private getKey(payload: RepoPayload): string {
    const { name, user, sha, service } = payload;
    return `${service}:${user}:${name}:${sha}`;
  }

  private handleExit(repo: RepoPayload, code: any) {
    log(`Server exit: ${code}`);
    this.serversMap.delete(this.getKey(repo));
  }

  private handleError(repo: RepoPayload, error: any) {
    log(`Server error: ${error}`);
  }
}
