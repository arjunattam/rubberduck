# Authentication flow

Mandatory reading: [unique client id for installation](https://stackoverflow.com/a/23854032/1469222).

## Extension state

1.  `client_id`: This is a random string that is synced using the `chrome.storage.sync` API

2.  `token`: This is the jwt object, that we get from the server. This object can be decoded to get the user payload (username, etc.) Since the secret key not shared with the frontend, the frontend has to assume that the jwt is valid. If required, frontend can make a verify API call to validate the token.

The `client_id` is the default identifier for all installations. This will allow user identification even if the Github account has not been linked to the extension. Users will be able to browse public repositories data without logging in via Github.

## Flow

1.  When the extension is installed, try fetching the `client_id` value from the `chrome.storage.sync` API. We will get the value if the user has installed the extension in the past.

2.  Make an API with this `client_id`, and get the `jwt` for the corresponding User object. The backend maintains this logic.

3.  The `jwt` will have an expiry, so the extension is responsible for keeping it up to date with the refresh API call.

4.  The user can link their Github login (login with Github). This will initiate the Github OAuth flow from the backend, and on success, the backend with link the github token with this user's jwt. The backend will redirect to the extension url -- generated using the `chrome.identity` API.

5.  When the extension gets the OAuth success redirection, it can refresh the local `jwt` to get an updated user payload that has the Github data of the user.

6.  At any point if the `client_id` is lost, then reinitiate step 1.

## API (backend) urls

1.  Get jwt for id: `/api/token_issue/`

2.  Refresh jwt: `/api/token_refresh/`

3.  Verify jwt is valid: `/api/token_verify/`

4.  Initiate github login flow: `/github_oauth/`
