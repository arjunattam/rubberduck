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
