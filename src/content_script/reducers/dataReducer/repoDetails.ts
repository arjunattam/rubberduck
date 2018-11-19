import { createReducer, Action } from "redux-create-reducer";

interface IRepoDetailsAction extends Action {
  payload: RemoteView;
}

interface LegacyRepoDetails {
  baseSha: string | undefined;
  headSha: string | undefined;
  branch: string | undefined;
  isPrivate: boolean;
  path: string | undefined;
  prId: string | undefined;
  reponame: string;
  type: ViewType;
  username: string;
}

const convert = (payload: RemoteView): LegacyRepoDetails => {
  return {
    baseSha: payload.base ? payload.base.sha : undefined,
    headSha: payload.head.sha,
    branch: payload.head.branch,
    isPrivate: payload.isPrivate,
    path: payload.filePath,
    prId: payload.pullRequestId,
    reponame: payload.head.name,
    username: payload.head.user,
    type: payload.type
  };
};

export const repoDetails = createReducer(
  {},
  {
    SET_REPO_DETAILS: (state, action) => {
      const { payload } = action as IRepoDetailsAction;
      return {
        ...state,
        ...convert(payload)
      };
    }
  }
);

export const view = createReducer(
  {},
  {
    SET_REPO_DETAILS: (state, action) => {
      const { payload } = action as IRepoDetailsAction;
      return {
        ...state,
        ...payload
      };
    }
  }
);
