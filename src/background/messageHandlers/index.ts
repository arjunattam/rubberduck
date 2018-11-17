import * as http from "./http";
import * as storage from "./storage";
import * as permissions from "./permissions";
import * as auth from "./auth";
import NativeMessenger from "./native";

interface IMessageRequest {
  message: string;
  data: any;
}

export const onMessageReceived = (
  req: IMessageRequest,
  sender,
  resultCallback
) => {
  console.log("Message received", req);

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
    NATIVE_INFO: (data, cb) => NativeMessenger.info(data, cb),
    NATIVE_INITIALIZE: (data, cb) => NativeMessenger.initialize(data, cb),
    NATIVE_HOVER: (data, cb) => NativeMessenger.hover(data, cb),
    NATIVE_DEFINITION: (data, cb) => NativeMessenger.definition(data, cb),
    NATIVE_REFERENCES: (data, cb) => NativeMessenger.references(data, cb),
    NATIVE_FILE_CONTENTS: (data, cb) => NativeMessenger.contents(data, cb)
  };
  handlers[req.message](req.data, resultCallback);

  // Return true to inform that we will send response async
  return true;
};
