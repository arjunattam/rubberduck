import GithubPathAdapter from "./path";

test("session persists for PR pages", () => {
  const baseRepoDetails = {
    baseSha: null,
    headSha: null,
    isPrivate: true,
    path: null,
    prId: "37",
    reponame: "mercury-extension",
    type: "pull",
    username: "karigari"
  };
  const prevDetails = {
    ...baseRepoDetails,
    branch: null
  };
  const newDetails = {
    ...baseRepoDetails,
    branch: "develop"
  };
  const isSameSession = GithubPathAdapter.isSameSessionPath(
    prevDetails,
    newDetails
  );
  expect(isSameSession).toEqual(true);
});
