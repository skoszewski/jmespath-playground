# JMESPath Testing Tool

A React-based web application for testing and validating JMESPath expressions against JSON data in real-time. This interactive tool provides a user-friendly interface to experiment with JMESPath queries and see results instantly.

![JMESPath Testing Tool](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-green?style=flat-square&logo=node.js)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple?style=flat-square&logo=bootstrap)

## Features

- **Real-time Evaluation**: JMESPath expressions are evaluated instantly as you type
- **File Upload**: Load JSON data directly from local files (supports JSON Lines format for .log files)
- **Remote API**: Upload sample data remotely via REST API with encrypted sessions
- **Container Ready**: Containerized for easy deployment

## Quick Start

### Prerequisites

- Node.js 24 LTS or higher
- npm package manager

### Local Development

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd jmespath-playground
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Development

For development with hot reload on component changes:

```bash
npm run dev
```

This runs both the React dev server (with hot reload) and the API server concurrently. The React app will proxy API requests to the backend server.

### Container Deployment

You can optionally run the application in a container:

```bash
# Build the container image
npm run build-image

# Run the container (Docker or Apple Container Tools)
docker run -p 3000:3000 jmespath-playground
# or
container run -p 3000:3000 jmespath-playground
```

## Usage

1. **Enter a JMESPath expression** in the top input field (e.g., `people[*].name`)
2. **Add JSON data** using one of these methods:
   - **Load an Object**: Click "📄 Load an Object" to upload standard JSON files (.json)
   - **Load a Log File**: Click "📋 Load a Log File" to upload JSON Lines files (.log) - each line converted to array
   - **Paste or type**: Enter JSON data directly in the bottom-left textarea
   - **Load sample**: Use the "Load Sample" button for quick testing
3. **View the results** in the bottom-right output area
4. **Use the toolbar buttons** to:
   - Load JSON objects from standard .json files
   - Load log files from JSON Lines .log files (auto-converted to arrays)
   - Load sample data for testing
   - Format JSON for better readability
   - Clear all inputs

## Remote API Usage

The application includes a REST API for uploading sample data remotely:

1. **Access API Key**: Click the key-lock button (🔒) to view your unique API key
2. **Upload Data**: Use curl or any HTTP client to upload JSON data:
   ```bash
   curl -X POST \
       -H "Content-Type: application/json" \
       -H "X-API-Key: YOUR_API_KEY" \
       --data @sample-data.json \
       "http://your-domain.com/api/v1/upload"
   ```
3. **Auto-reload**: The running app will detect new data and show a reload button

**API Endpoints:**
- `POST /api/v1/upload` - Upload sample data
- `GET /api/v1/sample` - Retrieve current sample data
- `GET /api/v1/state` - Get current state ID
- `GET /api/v1/health` - Simple health check (returns "OK")
- `GET /api/v1/status` - Detailed status information (JSON)

## Server Configuration

The server can be configured using environment variables:

**Network Settings:**
- `LISTEN_ADDR` - Server bind address (default: `127.0.0.1`)
- `LISTEN_PORT` - Server port (default: `3000`)

**Session Management:**
- `MAX_SESSIONS` - Maximum number of concurrent sessions (default: `100`)
- `MAX_SAMPLE_SIZE` - Maximum size of uploaded sample data in bytes (default: `1048576` - 1MB)
- `MAX_SESSION_TTL` - Session time-to-live in milliseconds (default: `3600000` - 1 hour)

Example usage:

```bash
MAX_SESSIONS=200 MAX_SAMPLE_SIZE=2097152 LISTEN_PORT=8080 node server.js
```

## Technology Stack

- **React 18.2.0**: Frontend framework with modern hooks and components
- **Bootstrap 5.3.2**: CSS framework with dark/light theme support
- **JMESPath 0.16.0**: JMESPath expression evaluation library
- **Express.js 4.19.2**: Backend API server with session management
- **Node.js 24 LTS**: Runtime environment
- **UUID 9.0.0**: Cryptographically secure session IDs
- **Container**: Containerization for easy deployment

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About JMESPath

JMESPath is a query language for JSON. It allows you to declaratively specify how to extract elements from a JSON document. For more information about JMESPath syntax and capabilities, visit the [official JMESPath website](https://jmespath.org/).
