import { bindActionCreators } from "redux";

export function updateJWT(data) {
  return {
    type: "UPDATE_JWT",
    payload: data
  };
}

export function updateClientId(data) {
  return {
    type: "UPDATE_CLIENT_ID",
    payload: data
  };
}
