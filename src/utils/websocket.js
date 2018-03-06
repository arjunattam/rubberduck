import Store from "../store";
import WebSocketAsPromised from "websocket-as-promised";
import { rootUrl } from "./api";

class BaseWebSocket {
  // Base class that has methods for a socket connection
  constructor() {
    this.wsp = null;
  }

  createWebsocket = token => {
    const baseWsUrl = rootUrl.replace("http", "ws");
    const wsUrl = `${baseWsUrl}sessions/?token=${token}`;
    this.wsp = new WebSocketAsPromised(wsUrl, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: message => JSON.parse(message),
      attachRequestId: (data, requestId) =>
        Object.assign({ id: requestId }, data),
      extractRequestId: data => data && data.id
    });
  };

  connectSocket = (token, onClose) => {
    this.createWebsocket(token);
    this.wsp.onClose.addListener(response => onClose(response));
    return this.wsp.open();
  };

  tearDown = () => {
    if (this.wsp !== null) {
      return this.wsp.close().then(() => (this.wsp = null));
    } else {
      // Socket was never actually created
      new Promise((resolve, reject) => {
        resolve();
      });
    }
  };

  sendRequest = payload => {
    return new Promise((resolve, reject) => {
      this.wsp.sendRequest(payload).then(response => {
        // response can have result or error
        // call promise method accordingly
        if (response.error !== undefined) {
          reject(response);
        } else {
          resolve(response);
        }
      });
    });
  };

  setupListener = listener => {
    this.wsp.onPackedMessage.addListener(message => {
      // Console log if this will not be handled by a promise later
      if (message.id === undefined) {
        listener(message);
      }
    });
  };

  createPRSession = (organisation, name, pull_request_id) => {
    return this.sendRequest({
      type: "session.create",
      payload: {
        organisation,
        name,
        service: "github",
        pull_request_id
      }
    });
  };

  createCompareSession = (organisation, name, head_sha, base_sha) => {
    return this.sendRequest({
      type: "session.create",
      payload: {
        organisation,
        name,
        service: "github",
        head_sha,
        base_sha
      }
    });
  };

  getHover = (baseOrHead, filePath, lineNumber, charNumber) => {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    return this.sendRequest({
      type: "session.hover",
      payload: queryParams
    });
  };

  getReferences = (baseOrHead, filePath, lineNumber, charNumber) => {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    return this.sendRequest({
      type: "session.references",
      payload: queryParams
    });
  };

  getDefinition = (baseOrHead, filePath, lineNumber, charNumber) => {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    return this.sendRequest({
      type: "session.definition",
      payload: queryParams
    });
  };
}

class WebSocketManager {
  // The manager maintains the socket connection for a session
  // Ensures connectivity, handles session status updates
  constructor() {
    this.isConnected = false;
    this.isReady = false;
    this.connectedSessionHash = null;
    this.ws = new BaseWebSocket();
  }

  dispatchStatus = status => {
    Store.dispatch({
      type: "UPDATE_SESSION_STATUS",
      sessionStatus: status
    });
  };

  statusUpdatesListener = message => {
    // This will trigger the UI states for session status
    console.log(message);
    this.dispatchStatus(message.status_update);

    if (message.status_update === "ready") {
      this.isReady = true;
    }
  };

  setupListener = () => {
    this.ws.setupListener(message => {
      if (message.status_update !== undefined) {
        this.statusUpdatesListener(message);
      }
    });
  };

  onSocketClose = response => {
    // response has {code, reason}
    // TODO(arjun): reconnect here
    console.log("looks like the socket closed", response);
  };

  createConnection = () => {
    const token = Store.getState().storage.token;
    return new Promise((resolve, reject) => {
      this.ws
        .connectSocket(token, this.onSocketClose)
        .then(() => {
          this.isConnected = true;
          this.isReady = false;
          this.setupListener();
          resolve();
        })
        .catch(() => {
          console.log("Error in connecting socket");
          this.isConnected = false;
          reject();
        });
    });
  };

  tearDownIfRequired = () => {
    if (this.isConnected) {
      this.isReady = false;
      this.isConnected = false;
      return this.ws.tearDown();
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  };

  createSession = params => {
    // This method is called with params, and internally
    // we need to figure out which type of session this is
    console.log("session params", params);
    return this.tearDownIfRequired()
      .then(this.createConnection)
      .then(() => {
        if (params.type === "pull") {
          this.dispatchStatus("creating");
          this.ws.createPRSession(
            params.organisation,
            params.name,
            params.pull_request_id
          );
        } else if (params.type === "file") {
          this.dispatchStatus("creating");
          this.ws.createCompareSession(
            params.organisation,
            params.name,
            params.head_sha
          );
        } else if (params.type === "commit" || params.type === "compare") {
          this.dispatchStatus("creating");
          this.ws.createCompareSession(
            params.organisation,
            params.name,
            params.head_sha,
            params.base_sha
          );
        }
      });
  };

  getLSCallHelper = (method, ...params) => {
    // We can only make these calls once ready
    if (this.isReady) {
      return method(...params);
    } else {
      return new Promise((resolve, reject) => {
        console.log("session not ready");
        reject();
      });
    }
  };

  getHover = (...params) => {
    return this.getLSCallHelper(this.ws.getHover, ...params);
  };

  getReferences = (...params) => {
    return this.getLSCallHelper(this.ws.getReferences, ...params);
  };

  getDefinition = (...params) => {
    return this.getLSCallHelper(this.ws.getDefinition, ...params);
  };
}

export const WS = new WebSocketManager();
