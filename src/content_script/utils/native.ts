import { sendMessagePromise } from "./chrome";
import { encodeToBase64 } from "./data";

export const info = async () => {
  const response = await sendMessagePromise("NATIVE_INFO", {});
  return response;
};

export const initialize = async (params: RemoteView) => {
  // This will first clone both head and base, and then
  // initialize the language servers
  // TODO: implement for base
  const { head } = params;
  await sendMessagePromise("NATIVE_CLONE_AND_CHECKOUT", head);
  const response = await sendMessagePromise("NATIVE_INITIALIZE", head);
  return response;
};

export const hover = async (
  params: LanguageQueryParams
): Promise<HoverResult | undefined> => {
  // TODO: verify that `sha`, which defines head or base
  // in a PR view, is used correctly.
  const response = await sendMessagePromise("NATIVE_HOVER", params);
  // Translate LSP response to what our app expects
  const { result } = response;

  if (!!result) {
    const { contents } = result;
    return {
      signature: contents[0].value,
      name: "name", // TODO: get name, maybe via definition call
      language: contents[0].language,
      docstring: encodeToBase64(contents[2])
    };
  }
};

const getItems = async (repo: RepoReference, locations: Location[]) => {
  const itemPromises: Promise<ResultItem>[] = locations.map(
    async ({ path, range }): Promise<ResultItem> => {
      const { contents } = await sendMessagePromise("NATIVE_FILE_CONTENTS", {
        repo,
        query: { path }
      });
      return {
        codeSnippet: encodeToBase64(contents),
        lineNumber: range.start.line,
        startLineNumber: 0
      };
    }
  );
  return await Promise.all(itemPromises);
};

export const definition = async (
  params: LanguageQueryParams
): Promise<DefinitionResult> => {
  const hover = await sendMessagePromise("NATIVE_HOVER", params);
  const definition = await sendMessagePromise("NATIVE_DEFINITION", params);
  const items = await getItems(params.repo, definition.result);

  return {
    name: "name",
    filePath: definition.result[0].path,
    fileSha: params.repo.branch || params.repo.sha,
    docstring: encodeToBase64(hover.result.contents[2]),
    items
  };
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export const references = async (
  params: LanguageQueryParams
): Promise<UsageItem[]> => {
  const references = await sendMessagePromise("NATIVE_REFERENCES", params);
  const locations = <Location[]>references.result;
  const uniquePaths = [...new Set(locations.map(location => location.path))];
  const pathWiseItems = {};

  await asyncForEach(uniquePaths, async currentPath => {
    pathWiseItems[currentPath] = await getItems(
      params.repo,
      locations.filter(({ path }) => path === currentPath)
    );
  });
  return uniquePaths.map(currentPath => ({
    filePath: currentPath,
    fileSha: params.repo.branch || params.repo.sha,
    items: pathWiseItems[currentPath]
  }));
};

export const contents = async (
  path: string,
  repo: RepoReference
): Promise<string> => {
  const response = await sendMessagePromise("NATIVE_FILE_CONTENTS", {
    repo,
    query: { path }
  });
  return encodeToBase64(response.contents);
};
