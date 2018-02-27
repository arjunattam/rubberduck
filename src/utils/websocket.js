// Handlers for web socket stuff
class BaseWebSocket {
  constructor() {
    this.socket = this.createConnection();

    this.socket.onmessage = function(event) {
      console.log("received:", JSON.parse(event.data));
    };
  }

  createConnection() {
    console.log("creating socket connection");
    return new WebSocket("ws://localhost:8000/sessions/");
  }

  sendToSocket(msgJson) {
    console.log("sending", msgJson);
    this.socket.send(JSON.stringify(msgJson));
  }

  createSession(pull_request_id, organisation, reponame) {
    return this.sendToSocket({
      type: "session.create",
      pull_request_id,
      organisation,
      name: reponame,
      service: "github"
    });
  }

  getHover(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`,
      type: "session.hover"
    };
    return this.sendToSocket(queryParams);
  }
}

export const WS = new BaseWebSocket();
