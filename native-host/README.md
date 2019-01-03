# Rubberduck native host

[![npm version](https://badge.fury.io/js/rubberduck-native.svg)](https://badge.fury.io/js/rubberduck-native)

This is the native host application for the Rubberduck browser extension. The native host manages git repositories on your file system, and runs a language server to give usages and definitions.

To install the native application, run:

```
npm install -g rubberduck-native
```

## Development

The native host uses message passing to communicate with the browser extension, built over the [Native Messaging](https://developer.chrome.com/apps/nativeMessaging) APIs.

The native host application runs as a binary, because `#!/usr/bin/node` is not available in \$PATH when Chrome launches the host.

The binary is built using `pkg`, after compiling the code with `tsc`. Before you build, ensure you are on node version 8.3.0 (so that we can use a pre-built image from nexe releases).

```
nvm use 8.3.0
npm run compile
```

To register the binary with Chrome (use `-b` to specify the binary location):

```
node register -b /Users/arjun/mercury-extension/native-host/bin/rubberduck-native-mac
```

The binary supports macOS only. With a few changes to the compile and register script definitions, we will be able to support Windows and Linux as well.
