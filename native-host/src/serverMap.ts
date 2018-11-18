import { TypeScriptServer, spawnServer } from "./tsServer";
import { RepoPayload } from "./types";

export class LangServersMap {
  serversMap = new Map<string, TypeScriptServer>();

  createServer(payload: RepoPayload) {
    const existingServer = this.fetchServer(payload);

    if (!!existingServer) {
      // We already have a server
      return existingServer;
    }

    const process = spawnServer();
    // TODO: listen for case when the ts server dies
    // on its own
    const tsServer = new TypeScriptServer(process, payload);
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

  private getKey(payload: RepoPayload): string {
    const { name, user, sha, service } = payload;
    return `${service}:${user}:${name}:${sha}`;
  }
}
