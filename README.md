# mercury-extension

This repo is the chrome extension for the mercury project.

## Setup

1. Install dependencies

   ```
   yarn
   ```

2. For development, we will run the dev server, and load an unpacked extension on Chrome. See [how to](https://developer.chrome.com/extensions/getstarted#unpacked). Open an [example github url](https://github.com/pallets/flask) to see this in action.

   ```
   npm run start
   ```

3. To distribute binary file, we pack the extension into a crx file, located at `dist/mercury.crx`. Generate new crx using the command:

   ```
   npm run pack
   ```

## Architecture

The extension has two components

1. [Background page](public/background.js): this is the main page of the extension (also called "event page") in the docs. The background page listens for some chrome events, and injects scripts to the page.

2. [Content script](src/index.js): this is the script that is injected in the page using [programmatic injection](https://developer.chrome.com/extensions/content_scripts#pi). Since the injected script renders elements, this is built using React.

### Docs

1. [Authentication](docs/AUTHENTICATION.md)
2. [Development](docs/DEVELOPMENT.md)

## Some issues

1. We need an icon and a landing page on a website. Perhaps a new name?

2. Options configuration: to be able to run the extension with a locally deployed server setup.

3. The injected elements inherit some styling from the Github page, which needs to be fixed.

4. Some things need to be checked for big repos: recursive files tree API will not work, big pull requests might have file query limitations. Need to evaluate.

5. Branch and sha needs to be a first class citizen for navigation.

## Testing with localhost

1. Run the local server

   ```
   python manage.py runserver
   ```

2. Change `src/utils/api.js`

3. Run the extension

   ```
   npm start
   ```

4. Delete and reinstall on chrome if you were running the production build. TODO -- clean this up.
