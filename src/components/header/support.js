import { getGitService } from "../../adapters";

const serviceName = () => {
  switch (getGitService()) {
    case "github":
      return "GitHub";
    case "bitbucket":
      return "Bitbucket";
    default:
      return "";
  }
};

const SUPPORT_LINKS_BASIC = {
  unsupported_language: {
    text:
      "The language of this repository is not currently supported by Rubberduck.",
    link: "https://support.rubberduck.io/articles/26922"
  },
  no_access: {
    text: `Rubberduck is not authorised to access this repository. You can use self-hosted, or login through your ${serviceName()} account.`,
    link: "https://support.rubberduck.io/articles/26923"
  }
};

const SUPPORT_LINKS_SELF_HOSTED = {
  disconnected: {
    text:
      "Rubberduck is not able to communicate with the menu bar app. Is the app running, and on the correct port?",
    link: "https://support.rubberduck.io/articles/26924"
  },
  unsupported_language: {
    text:
      "The language of this repository is not currently supported by Rubberduck.",
    link: "https://support.rubberduck.io/articles/26922"
  },
  no_access: {
    text:
      "Rubberduck is not authorised to access this repository. Configure your access tokens in the menu bar app.",
    link: "https://support.rubberduck.io/articles/26916"
  }
};

export const getSupportLink = ({ status }, hasMenuApp) => {
  if (hasMenuApp) {
    return SUPPORT_LINKS_SELF_HOSTED[status];
  } else {
    return SUPPORT_LINKS_BASIC[status];
  }
};
