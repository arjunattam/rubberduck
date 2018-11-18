import * as http from "./http";
import * as storage from "./storage";
import * as permissions from "./permissions";
import * as auth from "./auth";
import NativeHost from "./native";

interface IMessageRequest {
  message: string;
  data: any;
}

export const onMessageReceived = (
  req: IMessageRequest,
  sender: chrome.runtime.MessageSender,
  resultCallback
) => {
  console.log("Message from tab:", req);
  const tabId = sender.tab ? sender.tab.id : undefined;

  // TODO(arjun): handle runtime.lastError for each of these handlers
  // https://developer.chrome.com/apps/runtime#property-lastError
  const handlers = {
    AUTH_TRIGGER: auth.triggerAuthFlow,
    STORAGE_SYNC_SET: storage.saveToSyncStorage,
    STORAGE_LOCAL_SET: storage.saveToLocalStorage,
    STORAGE_GET_ALL: storage.getAllFromStorage,
    HTTP_GET: http.getAjax,
    HTTP_POST: http.postAjax,
    PERMISSIONS_UPDATE: permissions.updatePermissions,

    // For native messaging
    NATIVE_INFO: (data, cb) => NativeHost.info(tabId, data, cb),
    NATIVE_CLONE_AND_CHECKOUT: (data, cb) =>
      NativeHost.cloneAndCheckout(tabId, data, cb),
    NATIVE_INITIALIZE: (data, cb) => NativeHost.initialize(tabId, data, cb),
    NATIVE_HOVER: (data, cb) => NativeHost.hover(tabId, data, cb),
    NATIVE_DEFINITION: (data, cb) => NativeHost.definition(tabId, data, cb),
    NATIVE_REFERENCES: (data, cb) => NativeHost.references(tabId, data, cb),
    NATIVE_FILE_CONTENTS: (data, cb) => NativeHost.contents(tabId, data, cb)
  };
  handlers[req.message](req.data, resultCallback);

  // Return true to inform that we will send response async
  return true;
};
