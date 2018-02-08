# mercury-extension

This repo is the chrome extension for the mercury project.

## Setup

1. Install dependencies

   ```
   yarn
   ```

2. For local development, and then open localhost:3000

   ```
   npm run start
   ```

3. For local deployment as chrome extension, build and then load an unpacked extension. See [how to](https://developer.chrome.com/extensions/getstarted#unpacked).

   ```
   npm run build
   ```

4. To distribute binary file, pack the code into a .crx file. Current version is located at `dist/mercury.crx`.

   ```
   npm run pack
   ```

## Architecture

The extension has two components

1. [Background page](public/background.js): this is the main page of the extension (also called "event page") in the docs. The background page listens for some chrome events, and injects scripts to the page.

2. [Content script](src/index.js): this is the script that is injected in the page using [programmatic injection](https://developer.chrome.com/extensions/content_scripts#pi). Since the injected script renders elements, this is built using React.

### Docs

1. [Authentication](docs/AUTHENTICATION.md)

## Some issues

1. We need an icon and a landing page on a website. Perhaps a new name?

2. Options configuration: to be able to run the extension with a locally deployed server setup.

3. The injected elements inherit some styling from the Github page, which needs to be fixed.

4. Some things need to be checked for big repos: recursive files tree API will not work, big pull requests might have file query limitations. Need to evaluate.

5. Branch and sha needs to be a first class citizen for navigation.
