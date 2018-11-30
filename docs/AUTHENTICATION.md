# Authentication

Rubberduck supports authentication using GitHub personal access tokens. Potential improvements are being tracked [in this issue](https://github.com/karigari/rubberduck/issues/42).

## Getting a token

1. Head over to GitHub [create token page](https://github.com/settings/tokens/new).
2. Select the **repo** scope. The browser extension uses a read-only access to the repo code to provide code-aware features (like usages/definitions).
3. Set the token in the [browser extension settings](chrome-extension://nopekhgebkpkbjoclackdlofmcpokgmc/options.html) (requires extension to be installed).

## Where is my code stored?

Rubberduck runs locally, without any external dependencies. Which means your repo code is stored only on your machine. To see current state of repos on disk, open the [extension settings page](chrome-extension://nopekhgebkpkbjoclackdlofmcpokgmc/options.html).

## Where is my token stored?

Currently, the token is stored inside the browser's local storage (using the `chrome.storage.local` APIs). This ensures that the token is **not synced**, or available to any other entity apart from the browser extension.

A better place to store tokens will be the local system keychain, which is in the backlog and [tracked here](https://github.com/karigari/rubberduck/issues/42).
