---
description: Instructions for using the JMESPath Testing Tool repository.
applyTo: "**/*.md,**/.js"
---
# AI Agent Instructions for JMESPath Testing Tool

The tool in this repository is designed to help users validate and test JMESPath expressions against JSON data. It is a React-based web application that provides an interactive interface for entering JMESPath queries and viewing the results.

The main application page is divided into three sections:

- Top section: Title and description of the tool.
  - Theme control buttons (auto/light/dark)
  - Key-lock button that switches to the second application page.
- Middle section:
  - The label "JMESPath Expression" with a right allinged row of action buttons:
    - Load an Object
    - Load a Log File
    - Load Sample
    - Format JSON
    - Clear All
  - Input area for JMESPath expressions
  - Message area for errors related to JMESPath expression syntax
- Lower Middle left section: Input area for JSON data
- Lower Middle right section: Output are for JMESPath query results
- Bottom section: Footer with author and license information

The Middle section also contains a toolbar with buttons to load data from disk, load sample data, format JSON input, and clear all inputs.

The second page of the application contains:

- Top section: that is the same as the main page
- Middle section:
  - API key display area with a button to regenerate the API key. The API key is 32 characters long cryptograghically secure random string.
  - Instructions on how to use the API to upload sample data remotely with a code block displaying example curl command.
- Bottom section: Footer with author and license information.

The sample code block:

```bash
curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "X-API-Key: {{API_KEY}}" \
    --data @{{JSON_FILE_NAME}} \
    "{{API_URL}}/api/v1/upload"
```

Placeholders `{{API_KEY}}` and `{{API_URL}}` should be replaced with the actual API key and the URL of the deployed application respectively. The `{{JSON_FILE_NAME}}` placeholder should be shown as is to indicate the file containing the JSON data to be uploaded.

The server code is only used as a bridge between the UI app and the external tools that may upload the sample data. The server does not perform any JMESPath evaluation or JSON parsing; all such logic is handled in the React application.

The server exposes a REST API to allow external tools to upload sample data that users can load into the application. The API key is required to upload sample data.

The API key is used for:

- encrypting the sample data
- authenticating download requests

Session id is a hash of the API key.

The server keeps two pieces of information in memory for each session:

1. The sample data itself.
2. A state variable (a GUID) that changes whenever new sample data is uploaded.

The maximum number of sessions to keep in memory set at the server startup using `MAX_SESSIONS` environment variable that defaults to 100. The maximum size of the sample data is set using `MAX_SAMPLE_SIZE` environment variable that defaults to 1 MB. Maximum session age is controlled using `MAX_SESSION_TTL` environment variable that defaults to 1 hour. After reaching the maximum number of sessions, the server rejects new uploads until some sessions expire. Sessions older than the maximum session age are automatically purged.

The UI generates an API key at startup then load the sample data at startup and periodically checks the state variable to see if new sample data is available. If state variable changes, the React app displays a button beneath the expression input area to reload the sample data. The reload is performed only when the user clicks the button.

---

The main components of the application are located in the `src` directory and target Node 24 LTS environment.

Framework to be used:

- React for building the user interface.
- JavaScript (ES6+) for scripting.
- Bootstrap for styling and layout.
- Express.js for serving the application and handling API requests.

### API

The application exposes a REST API for remotly uploading sample data. The API endpoints are as follows:

- `POST /api/v1/upload`: The sample data is sent in the request body as JSON. The request must include an `x-api-key` header with the API key. If the upload is successful, the server responds with status 200 OK.

  The server stores the sample data in memory and generates a new value for its state variable (a guid).

- `GET /api/v1/sample`: Returns the currently stored sample data as JSON. The request must include an `x-api-key` header with the API key. If the API key is invalid or the header is missing, the server responds with status 403 Forbidden.

- `GET /api/v1/state`: Returns the current value of the state variable (a guid) as a string. The request must include an `x-api-key` header with the API key. If the API key is invalid or the header is missing, the server responds with status 403 Forbidden.

## Containerization

The application should be prepared for deployment using containerization. It should extend minimal Node 24 LTS container image.

## Updates

Always use `scripts/new-version.js` script to make a new release.

Correct procedure to make a new release:

- Review the code changes and ensure everything is working.
- Run `npm run build` to build the React application.
- Run `npm test` to execute the test suite and ensure all tests pass.
- Prepare a commit message describing the changes made.
- Use `scripts/new-version.js` to create a new version and commit the changes. Use `--force` option if repository is not clean.
- Don't push the changes without approval.
- Don't build docker image without approval.
