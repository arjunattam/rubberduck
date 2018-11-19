export interface RepoPayload {
  user: string;
  name: string;
  service: string;
  sha: string;
}

export interface TabRepoValue {
  hash: string;
  data: RepoPayload;
}

export class TabRepoMap {
  // This is a mapping of tab ids and repo payloads
  tabRepos = new Map<number, TabRepoValue>();

  set(tabId, repoPayload: RepoPayload) {
    return this.tabRepos.set(tabId, {
      hash: this.getHash(repoPayload),
      data: repoPayload
    });
  }

  get(tabId): RepoPayload | undefined {
    const value = this.tabRepos.get(tabId);
    return !!value ? value.data : undefined;
  }

  delete(tabId) {
    return this.tabRepos.delete(tabId);
  }

  hasTabForRepo(repoPayload: RepoPayload) {
    const hashToFind = this.getHash(repoPayload);
    let found = false;

    this.tabRepos.forEach((value: TabRepoValue, key: number) => {
      if (value.hash === hashToFind) {
        found = true;
      }
    });

    return found;
  }

  getHash(payload: RepoPayload) {
    const { name, user, sha, service } = payload;
    return `${service}:${user}:${name}:${sha}`;
  }
}
