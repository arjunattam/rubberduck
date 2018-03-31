let envRootUrl = "https://www.codeview.io/";

if (process.env.REACT_APP_BACKEND_ENV === "local") {
  envRootUrl = "http://localhost:8000/";
}

const rootUrl = envRootUrl;
const baseApiUrl = "api/v1";

export { rootUrl, baseApiUrl };
