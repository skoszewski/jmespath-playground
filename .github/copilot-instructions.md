---
description: Instructions for using the JMESPath Testing Tool repository.
applyTo: "**/*.md,**/.js"
---
# AI Agent Instructions for JMESPath Testing Tool

The tool in this repository is designed to help users validate and test JMESPath expressions against JSON data. It is a React-based web application that provides an interactive interface for entering JMESPath queries and viewing the results.

The application is single page. The page is divided into three sections:

- Top section: Title and description of the tool.
- Middle section:
  - Input area for JMESPath expressions
- Lower Middle left section: Input area for JSON data
- Lower Middle right section: Output are for JMESPath query results
- Boottom section: Footer with author and license information

The Middle section also contains a toolbar with buttons to load data from disk, load sample data, format JSON input, and clear all inputs.

The main components of the application are located in the `src` directory and target Node 24 LTS environment.

Framework to be used:

- React for building the user interface.
- JavaScript (ES6+) for scripting.
- Bootstrap for styling and layout.
- Express.js for serving the application and handling API requests.

The server code is only used as a bridge between the UI app and the external tools that may upload the sample data. The server does not perform any JMESPath evaluation or JSON parsing; all such logic is handled in the React application.

The server keeps two pieces of information in memory:

1. The sample data itself.
2. A state variable (a GUID) that changes whenever new sample data is uploaded.

The React application load the sample data at startup and periodically checks the state variable to see if new sample data is available. If state variable changes, the React app fetches the new sample data and the state variable again.

### API

The application exposes a REST API for remotly uploading sample data. The API endpoints are as follows:

- `POST /api/v1/upload`: The sample data is sent in the request body as JSON.

  The server stores the sample data in memory and generates a new value for its state variable (a guid).

- `GET /api/v1/sample`: Returns the currently stored sample data as JSON.

- `GET /api/v1/state`: Returns the current value of the state variable (a guid) as a string.

## Containerization

The application should be prepared for deployment using containerization. It should extend minimal Node 24 LTS container image.
