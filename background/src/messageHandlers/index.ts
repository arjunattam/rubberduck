import * as http from "./http";
import * as storage from "./storage";
import * as permissions from "./permissions";
import * as auth from "./auth";

interface IMessageRequest {
  message: string;
  data: any;
}

export const onMessageReceived = (req: IMessageRequest, sender, sendRes) => {
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
    PERMISSIONS_UPDATE: permissions.updatePermissions
  };
  handlers[req.message](req.data, sendRes);

  // Return true to inform that we will send response async
  return true;
};
