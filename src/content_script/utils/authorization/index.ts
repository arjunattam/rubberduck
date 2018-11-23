import ReduxStore from "../../store";

export class AuthStore {
  constructor(private store) {}

  hasChanged(prevStorage, newStorage) {
    return prevStorage.githubAccessToken !== newStorage.githubAccessToken;
  }

  getGithubHeader(): { type; token: string } {
    const { storage } = this.store.getState();
    return {
      type: `token`,
      token: storage.githubAccessToken
    };
  }
}

export const AuthUtils = new AuthStore(ReduxStore);
