import * as Moment from "moment";
import * as StorageUtils from "../../storage";
import Store from "../../../store";

const CACHED_EXPIRY = 3; // hours

const hash = (key: string) => {
  return key
    .split("")
    .reduce(
      (prevHash, currVal) =>
        ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
      0
    );
};

class APIResponsesCache {
  constructor(private store) {}

  public get(uri: string) {
    const encoded = hash(uri);
    const { storage } = this.store.getState();
    return storage.apiResponses[encoded] || {};
  }

  private getValidCacheEntries() {
    const { storage } = this.store.getState();
    const cache = storage.apiResponses;
    const now = Moment.now();

    let filteredCache = Object.keys(cache).reduce((res, key) => {
      const keyExpiry = cache[key].expiry;
      const isValid = Moment(keyExpiry).isAfter(now);

      if (isValid) {
        res[key] = cache[key];
      }
      return res;
    }, {});

    return filteredCache;
  }

  public async set(uri: string, response: any) {
    const encoded = hash(uri);
    const lastModified = response.headers["last-modified"];
    const link = response.headers["link"];
    const { data } = response;
    const expiry = Moment()
      .add(CACHED_EXPIRY, "hours")
      .format();

    if (lastModified && data) {
      let apiResponses = this.getValidCacheEntries();
      apiResponses[encoded] = { lastModified, data, expiry, link };
      await StorageUtils.setInLocalStore({ apiResponses }, () => {});
    }
  }

  public async update(uri: string, lastModified) {
    const encoded = hash(uri);
    const { storage } = this.store.getState();
    let apiResponses = storage.apiResponses;
    apiResponses[encoded] = { ...apiResponses[encoded], lastModified };
    await StorageUtils.setInLocalStore({ apiResponses }, () => {});
  }
}

export const apiResponsesCache = new APIResponsesCache(Store);
