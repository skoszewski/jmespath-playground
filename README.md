# JMESPath Testing Tool

A React-based web application for testing and validating JMESPath expressions against JSON data in real-time. This interactive tool provides a user-friendly interface to experiment with JMESPath queries and see results instantly.

![JMESPath Testing Tool](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-green?style=flat-square&logo=node.js)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple?style=flat-square&logo=bootstrap)

## Features

- 🎯 **Real-time Evaluation**: JMESPath expressions are evaluated instantly as you type
- 📝 **JSON Validation**: Built-in JSON syntax validation and error reporting
- 📁 **File Upload**: Load JSON data directly from local files (supports JSON Lines format for .log files)
- 🎨 **Bootstrap UI**: Clean, responsive interface with Bootstrap styling
- 🔄 **Sample Data**: Pre-loaded examples to get started quickly
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🐳 **Docker Ready**: Containerized for easy deployment
- ✅ **Error Handling**: Clear error messages for both JSON and JMESPath syntax issues

## Application Layout

The application is divided into three main sections:

1. **Top Section**: Title and description of the tool
2. **Middle Section**: Input area for JMESPath expressions
3. **Bottom Sections**: 
   - **Left**: JSON data input area
   - **Right**: Query results output area

## Quick Start

### Prerequisites

- Node.js 24 LTS or higher
- npm or yarn package manager

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

### Container Deployment (Optional)

You can optionally run the application in a Docker container:

```bash
# Build the Docker image
docker build -t jmespath-playground .

# Run the container
docker run -p 3000:3000 jmespath-playground
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

### Example JMESPath Expressions

Try these examples with the sample data:

- `people[*].name` - Get all names
- `people[0]` - Get the first person
- `people[?age > 30]` - Filter people older than 30
- `people[*].skills[0]` - Get the first skill of each person
- `length(people)` - Count the number of people

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. The page will reload when you make edits.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run serve`

Serves the production build locally on port 3000.

### Docker Scripts

### `npm run docker:build`

Builds a Docker container.

### `npm run docker:run`

Runs the Docker container.

## Project Structure

```
jmespath-playground/
├── .github/
│   ├── workflows/
│   │   └── build-container.yml   # CI/CD pipeline
│   └── copilot-instructions.md   # AI agent instructions
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # App-specific styles
│   ├── App.test.js     # App tests
│   ├── index.js        # React entry point
│   ├── index.css       # Global styles
│   ├── setupTests.js   # Test configuration
│   └── reportWebVitals.js
├── scripts/
│   ├── build.sh        # Build script
│   └── dev.sh          # Development script
├── Dockerfile          # Docker container
├── Dockerfile.dev      # Development container
├── docker-compose.yml  # Container orchestration
├── package.json        # Dependencies and scripts
├── README.md           # Comprehensive documentation
├── DEVELOPMENT.md      # Developer guide
└── demo.sh             # Demo script
```

## Technology Stack

- **React 18.2.0**: Frontend framework
- **Bootstrap 5.3.2**: CSS framework for styling
- **JMESPath 0.16.0**: JMESPath expression evaluation
- **Node.js 24 LTS**: Runtime environment
- **Docker**: Optional containerization

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit them: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About JMESPath

JMESPath is a query language for JSON. It allows you to declaratively specify how to extract elements from a JSON document. For more information about JMESPath syntax and capabilities, visit the [official JMESPath website](https://jmespath.org/).

## Support

If you encounter any issues or have questions, please [open an issue](../../issues) on GitHub.
