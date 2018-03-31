import Store from "../store";
import WebSocketAsPromised from "websocket-as-promised";
import { rootUrl } from "./api";
import { getGitService } from "../adapters";

function exponentialBackoff(attempt, delay) {
  return Math.floor(Math.random() * Math.pow(2, attempt) * delay);
}

class BaseWebSocket {
  // Base class that has methods for a socket connection
  constructor() {
    this.wsp = null;
  }

  isConnected = () => {
    return this.wsp && this.wsp.isOpened;
  };

  isConnecting = () => {
    return this.wsp && this.wsp.isOpening;
  };

  createWebsocket = (token, onClose) => {
    if (this.wsp === null) {
      const baseWsUrl = rootUrl.replace("http", "ws");
      const wsUrl = `${baseWsUrl}sessions/?token=${token}`;
      this.wsp = new WebSocketAsPromised(wsUrl, {
        packMessage: data => JSON.stringify(data),
        unpackMessage: message => JSON.parse(message),
        attachRequestId: (data, requestId) =>
          Object.assign({ id: requestId }, data),
        extractRequestId: data => data && data.id
      });
      this.wsp.onClose.addListener(response => onClose(response));
    }
  };

  connectSocket = (token, onClose) => {
    this.createWebsocket(token, onClose);
    return this.wsp.open();
  };

  tearDown = () => {
    if (this.wsp !== null) {
      return this.wsp.close().then(() => (this.wsp = null));
    } else {
      // Socket was never actually created
      return new Promise((resolve, reject) => {
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
        service: getGitService(),
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
        service: getGitService(),
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
    this.isReady = false;
    this.reconnectAttempts = 0;
    this.sessionParams = {};
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
    this.dispatchStatus(message.status_update);

    if (message.status_update === "ready") {
      this.isReady = true;
    } else if (message.status_update === "error") {
      console.log("Error in creating session", message);
    }
  };

  setupListener = () => {
    this.ws.setupListener(message => {
      if (message.status_update !== undefined) {
        this.statusUpdatesListener(message);
      }
    });
  };

  reconnectIfRequired = () => {
    // We should reconnect if the socket connection was `ready`
    // and the server disconnected.
    if (!this.ws.isConnected()) {
      this.reconnectAttempts += 1;
      this.createSession().then(response => {
        this.reconnectAttempts = 0;
      });
    }
  };

  tryReconnection = () => {
    setTimeout(
      this.reconnectIfRequired,
      exponentialBackoff(this.reconnectAttempts, 1000)
    );
  };

  onSocketClose = closeResponse => {
    this.dispatchStatus("disconnected");
    this.isReady = false;

    if (!closeResponse.wasClean) {
      // This means we did not explicitly close the connection ourself
      this.tryReconnection();
    }
  };

  createConnection = () => {
    const token = Store.getState().storage.token;
    return new Promise((resolve, reject) => {
      this.dispatchStatus("connecting");
      this.ws
        .connectSocket(token, this.onSocketClose)
        .then(() => {
          this.isReady = false;
          this.setupListener();
          resolve();
        })
        .catch(err => {
          console.log("Error in connecting socket", err);
          this.tryReconnection();
          reject(err);
        });
    });
  };

  tearDownIfRequired = () => {
    if (this.ws.isConnected() || this.ws.isConnecting()) {
      this.isReady = false;
      return this.ws.tearDown();
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  };

  createNewSession = params => {
    this.sessionParams = params;
    this.reconnectAttempts = 0;
    return this.createSession().catch(error => {
      console.log(error);
      if (error.error && error.error === "Language not supported") {
        this.dispatchStatus("unsupported_language");
      } else if (error === "No session to be created") {
        this.dispatchStatus("no_session");
      } else {
        this.dispatchStatus("error");
      }
      throw error;
    });
  };

  createSession = () => {
    // This method is called with params, and internally
    // we need to figure out which type of session this is
    const params = this.sessionParams;
    return this.tearDownIfRequired()
      .then(this.createConnection)
      .then(() => {
        if (params.type === "pull") {
          this.dispatchStatus("creating");
          return this.ws.createPRSession(
            params.organisation,
            params.name,
            params.pull_request_id
          );
        } else if (params.type === "file") {
          this.dispatchStatus("creating");
          return this.ws.createCompareSession(
            params.organisation,
            params.name,
            params.head_sha
          );
        } else if (params.type === "commit" || params.type === "compare") {
          this.dispatchStatus("creating");
          return this.ws.createCompareSession(
            params.organisation,
            params.name,
            params.head_sha,
            params.base_sha
          );
        } else {
          return Promise.reject("No session to be created");
        }
      })
      .then(response => {
        return response.result;
      });
  };

  getLSCallHelper = (method, ...params) => {
    // We can only make these calls once ready
    if (this.isReady) {
      return method(...params);
    } else {
      return new Promise((resolve, reject) => {
        console.log("session not ready");
        this.dispatchStatus("not_ready");
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
