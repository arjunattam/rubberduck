import { LangServersMap } from "./serverMap";
import { readFile, constructFileUri, constructRootUri, clean } from "./utils";
import * as git from "./git";
import packageJson from "../package.json";

const VERSION = packageJson.version;

export class MessageHandler {
  langServers = new LangServersMap();

  async handle(message: Message) {
    const { type } = message;

    switch (type) {
      case RequestType.Info:
        return this.handleInfoMessage(message);
      case RequestType.CloneCheckout:
        const gitManager = new git.GitManager(<RepoPayload>message.payload);
        const result = await gitManager.cloneAndCheckout();
        return { id: message.id, result };
      case RequestType.Initialize:
        return this.handleInitializeMessage(message);
      case RequestType.Hover:
        return this.handleHoverMessage(message);
      case RequestType.Definition:
        return this.handleDefinitionMessage(message);
      case RequestType.References:
        return this.handleReferencesMessage(message);
      case RequestType.FileContents:
        return this.handleFileContentsMessage(message);
      case RequestType.Exit:
        return this.handleExit(message);
    }
  }

  async handleInfoMessage(message: Message) {
    return {
      version: VERSION,
      id: message.id,
      servers: this.langServers.info(),
      git: await git.info()
    };
  }

  async handleInitializeMessage(message: Message) {
    const payload = <RepoPayload>message.payload;
    const server = this.langServers.createServer(payload);
    const response = await server.initialize(
      message.id,
      constructRootUri(payload)
    );
    return clean(response, payload);
  }

  async handleHoverMessage(message: Message) {
    const { query, repo } = <LanguageQueryPayload>message.payload;
    const server = this.langServers.fetchServer(repo);

    if (!!server) {
      const response = await server.hover(
        message.id,
        constructFileUri(repo, query.path),
        query.line,
        query.character
      );
      return clean(response, repo);
    }
  }

  async handleDefinitionMessage(message: Message) {
    const { query, repo } = <LanguageQueryPayload>message.payload;
    const server = this.langServers.fetchServer(repo);

    if (!!server) {
      const response = await server.definition(
        message.id,
        constructFileUri(repo, query.path),
        query.line,
        query.character
      );
      return clean(response, repo);
    }
  }

  async handleReferencesMessage(message: Message) {
    const { query, repo } = <LanguageQueryPayload>message.payload;
    const server = this.langServers.fetchServer(repo);

    if (!!server) {
      const response = await server.references(
        message.id,
        constructFileUri(repo, query.path),
        query.line,
        query.character
      );
      return clean(response, repo);
    }
  }

  async handleFileContentsMessage(message: Message) {
    const { query, repo } = <FileContentsPayload>message.payload;
    const contents = await readFile(constructFileUri(repo, query.path));
    return {
      contents,
      id: message.id
    };
  }

  async handleExit(message: Message) {
    const repo = <RepoPayload>message.payload;
    this.langServers.killServer(repo);
  }
}
