# Rubberduck native host

This is the native host application for the Rubberduck browser extension. The native host manages git repositories on your file system, and runs a language server to give usages and definitions.

[![npm version](https://badge.fury.io/js/rubberduck-native.svg)](https://badge.fury.io/js/rubberduck-native)

To install the native application, run:

```
npm install -g rubberduck-native
```

## Development

The native host uses message passing to communicate with the browser extension, built over the [Native Messaging](https://developer.chrome.com/apps/nativeMessaging) APIs.

To compile and build a binary, run the following. The build step packages the output into a binary file with `pkg`.

```
tsc && npm run build
```

To register the binary with Chrome (use `-b` to specify the binary location):

```
node register -b /Users/arjun/mercury-extension/native-host/bin/rubberduck-native
```
