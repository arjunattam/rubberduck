import amplitude from "amplitude-js";

export const init = () => {
  amplitude.getInstance().init("8034a5a01d1d44f4ac657a7360262339");
};

export const setupUser = userInfo => {
  const { username: userId } = userInfo;
  amplitude.getInstance().setUserId(userId);
  let userIdentity = new amplitude.Identify();
  Object.keys(userInfo).forEach(function(key) {
    userIdentity.set(key, userInfo[key]);
  });
  amplitude.getInstance().identify(userIdentity);
};

export const logSessionEvent = (type, properties) => {
  const name = `extension.session.${type}`;
  amplitude.getInstance().logEvent(name, properties);
};