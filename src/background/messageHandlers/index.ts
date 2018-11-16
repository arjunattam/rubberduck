import * as http from "./http";
import * as storage from "./storage";
import * as permissions from "./permissions";
import * as auth from "./auth";

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
    NATIVE_INFO: "",
    NATIVE_INITIALIZE: "",
    NATIVE_HOVER: "",
    NATIVE_DEFINITION: "",
    NATIVE_REFERENCES: ""
  };
  handlers[req.message](req.data, resultCallback);

  // Return true to inform that we will send response async
  return true;
};

// const testLS = async () => {
//   port.postMessage({ type: "INFO", payload: {} });
//   port.postMessage({
//     type: "INITIALIZE",
//     payload: { rootUri: "file:///Users/arjun/mercury-extension/native-host" }
//   });

//   port.postMessage({
//     type: "DEFINITION",
//     payload: {
//       fileUri: "file:///Users/arjun/mercury-extension/native-host/src/index.ts",
//       line: 0,
//       character: 11
//     }
//   });

//   port.postMessage({
//     type: "REFERENCES",
//     payload: {
//       fileUri: "file:///Users/arjun/mercury-extension/native-host/src/index.ts",
//       line: 0,
//       character: 11
//     }
//   });
// };
