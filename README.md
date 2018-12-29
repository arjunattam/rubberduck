# Rubberduck

<img width="100" height="100" align="right" src="./src/logo.svg" />

Rubberduck is a browser extension that improves code navigation on GitHub. Specifically, it helps:

- **Speed up code comprehension**: find symbol usages and definitions
- **Reduce context switches**: see documentation inline, on hovering on symbols
- **Navigate in control**: use the files tree to navigate diffs and code pages

See it in action on [our website](https://www.rubberduck.io/).

Rubberduck is completely open source, and runs entirely on your personal machine (without any external server dependency). We feel this is critical for users to be comfortable using it [on private repos](#using-on-private-repos).

## Setup

1. **Install the native host**: The browser extension relies on a native host application, which manages git repos, and runs the language analysis to find usages and definitions. The native host source is in the [`native-host` dir](./native-host/README.md). To install, run:

   ```
   npm install -g rubberduck-native
   ```

2. **Install the browser extension**: The browser extension is available on [the Chrome Store](https://chrome.google.com/webstore/detail/rubberduck/nopekhgebkpkbjoclackdlofmcpokgmc).

## Using on private repos

Rubberduck uses personal access tokens to access private repos. Potential improvements are being tracked [in this issue](https://github.com/karigari/rubberduck/issues/42).

### Getting a token

1. Head over to GitHub [create token page](https://github.com/settings/tokens/new).
2. Select the **repo** scope. The browser extension uses a read-only access to the repo code to provide code-aware features (like usages/definitions).
3. Set the token in the browser extension settings (`chrome-extension://nopekhgebkpkbjoclackdlofmcpokgmc/options.html`; requires extension to be installed).

### Where is my code stored?

Rubberduck runs locally, without any external dependencies. Which means your repo code is stored only on your machine. To see current state of repos on disk, open the extension settings page(`chrome-extension://nopekhgebkpkbjoclackdlofmcpokgmc/options.html`).

### Where is my token stored?

Currently, the token is stored inside the browser's local storage (using the `chrome.storage.local` APIs). This ensures that the token is **not synced** with other Chrome devices.

A better place to store tokens will be the local system keychain, which is in the backlog and [tracked here](https://github.com/karigari/rubberduck/issues/42).

## Contributions and support

Rubberduck is very new, actively developed and you might run into issues here and there. Please help us out by [filing an issue](https://github.com/karigari/rubberduck/issues) when you run into one.
