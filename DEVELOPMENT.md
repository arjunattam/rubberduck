# Development

# Rubberduck

This repository contains the Rubberduck chrome extension, and the native host app (inside `native-host`).

## Setup

1.  Install dependencies

    ```
    yarn
    ```

2.  For development, run this in watch mode. Note: this will require the native host to be configured first (see [native-host/README.md](native-host/README.md))

    ```
    npm run watch
    ```

3.  To distribute binary file, we can pack the extension into a crx file. Generate new crx using the command. Packing needs keys (see below).

    ```
    npm run pack
    ```

4.  Run tests with (defaults to watch mode).

    ```
    yarn test
    ```

## Development keys setup

- To be able to pack crx (for production), you need to setup `keys/production_key.pem` in your project directory. Get this key from [here](https://drive.google.com/drive/u/0/folders/1ABADv_hmG2FAsPYJokvv_FBw-z_nMQUT) (needs Google account).

- This should not be required if we are distributing the extension through the Chrome Store. See below for publishing.

## Publishing

1.  To publish the extension, ensure that your account on the [Chrome developer dashboard](https://chrome.google.com/webstore/developer/dashboard) is setup.

2.  Bump the version -- open `manifest.json` and bump the version depending on your changes.

3.  Generate the zip file for uploading using the following. This also uploads the source maps to Sentry.

    ```
    npm run chrome-build
    ```

4.  Upload the generated zip file (`bundle.zip`) on the Chrome dashboard.

## Architecture

The extension has three components, which are bundled individually through Webpack.

1.  Background page: this is the main page of the extension (also called "event page") in the docs. The background page listens for some chrome events, and injects scripts to the page.

2.  Content script: this is the script that is injected in the page using [programmatic injection](https://developer.chrome.com/extensions/content_scripts#pi). Since the injected script renders elements, this is built using React.

3.  Options page: this is the settings page. Not much to see here.
