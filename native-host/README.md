# Rubberduck native host

This is the native application for the Rubberduck chrome extension. This uses the [Native Messaging](https://developer.chrome.com/apps/nativeMessaging) APIs.

To build this run:

```
npm run build
```

Internally, the following 3 steps are executed:

1. Compile code using `tsc`
2. Package the output into a binary file with `pkg`
3. Register the native app manifest with Google Chrome (macOS only)
