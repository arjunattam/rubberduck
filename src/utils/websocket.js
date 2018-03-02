import Store from "../store";
import WebSocketAsPromised from "websocket-as-promised";
import { rootUrl } from "./api";
import { encodeToBase64 } from "./data";

class BaseWebSocket {
  // Base class that has methods for a socket connection
  constructor() {
    this.wsp = null;
  }

  createWebsocket(token) {
    const baseWsUrl = rootUrl.replace("http", "ws");
    const wsUrl = `${baseWsUrl}sessions/?token=${token}`;
    this.wsp = new WebSocketAsPromised(wsUrl, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: message => JSON.parse(message),
      attachRequestId: (data, requestId) =>
        Object.assign({ id: requestId }, data),
      extractRequestId: data => data && data.id
    });
  }

  connectSocket(token) {
    this.createWebsocket(token);
    return this.wsp.open();
  }

  tearDown() {
    if (this.wsp !== null) {
      return this.wsp.close();
    } else {
      // Socket was never actually created
      new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  sendRequest(payload) {
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
  }

  setupListener(listener) {
    this.wsp.onPackedMessage.addListener(message => {
      // Console log if this will not be handled by a promise later
      if (message.id === undefined) {
        listener(message);
      }
    });
  }

  createPRSession(organisation, reponame, pull_request_id) {
    return this.sendRequest({
      type: "session.create",
      payload: {
        organisation,
        name: reponame,
        service: "github",
        pull_request_id
      }
    });
  }

  createCompareSession(organisation, reponame, head_sha, base_sha) {
    return this.sendRequest({
      type: "session.create",
      payload: {
        organisation,
        name: reponame,
        service: "github",
        head_sha,
        base_sha
      }
    });
  }

  getHover(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    // sessionId is actually not required
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    return this.sendRequest({
      type: "session.hover",
      payload: queryParams
    });
  }

  getReferences(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    // sessionId is actually not required
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    return this.sendRequest({
      type: "session.references",
      payload: queryParams
    });
  }

  getDefinition(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    // sessionId is actually not required
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    return this.sendRequest({
      type: "session.definition",
      payload: queryParams
    });
  }
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

  statusUpdatesListener = message => {
    console.log("status update listener", message);
  };

  setupListener = () => {
    this.ws.setupListener(message => {
      if (message.status_update !== undefined) {
        this.statusUpdatesListener(message);
      }
    });
  };

  createConnection = () => {
    const token = Store.getState().storage.token;
    return new Promise((resolve, reject) => {
      this.ws
        .connectSocket(token)
        .then(() => {
          this.isConnected = true;
          resolve();
        })
        .catch(() => {
          console.log("Error in connecting socket");
          this.isConnected = false;
          reject();
        });
    });
  };

  createSession = params => {
    // This method is called with params, and internally
    // we need to figure out which type of session this is
    if (this.isConnected) {
      return this.ws.tearDown().then(this.createConnection);
    } else {
      return this.createConnection();
    }
  };
}

export const WS = new WebSocketManager();
