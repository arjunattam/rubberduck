import { getGitService } from "../adapters";
import { GithubPathAdapter } from "./github";

const service = getGitService();
// TODO: support bitbucket here
export default new GithubPathAdapter();
