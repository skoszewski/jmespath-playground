# Development Guide

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm start

# Build for production
npm run build

# Run tests
npm test

# Serve production build locally
npm run serve
```

## Docker Commands

```bash
# Build Docker container
docker build -t jmespath-playground .

# Run Docker container
docker run -p 3000:3000 jmespath-playground

# Development with Docker Compose
docker-compose --profile dev up jmespath-playground-dev

# Production with Docker Compose
docker-compose up jmespath-playground
```

## Project Structure Overview

```
src/
├── App.js          # Main component with JMESPath logic
├── App.css         # App-specific styles
├── App.test.js     # Basic tests
├── index.js        # React entry point
├── index.css       # Global styles and Bootstrap overrides
└── setupTests.js   # Test configuration
```

## Key Features Implemented

1. **Real-time JMESPath Evaluation**: Uses the `jmespath` library to evaluate expressions as user types
2. **JSON Validation**: Parses and validates JSON input with error reporting
3. **Bootstrap UI**: Responsive layout with cards, buttons, and form controls
4. **Error Handling**: Clear error messages for both JSON and JMESPath syntax issues
5. **Sample Data**: Pre-loaded examples with "Load Sample" button
6. **JSON Formatting**: "Format JSON" button to prettify JSON input
7. **Clear Function**: "Clear All" button to reset all inputs

## Component Architecture

The main `App.js` component manages:
- State for JMESPath expression, JSON data, results, and errors
- Auto-evaluation using `useEffect` when inputs change
- Error handling for both JSON parsing and JMESPath evaluation
- UI event handlers for buttons and input changes

## Styling

- Bootstrap 5.3.2 for responsive grid and components
- Custom CSS for enhanced UX (color coding, hover effects)
- Gradient header with professional appearance
- Color-coded input areas (yellow for JMESPath, green for JSON, blue for results)

## Browser Compatibility

Built with React 18 and targets:
- Modern evergreen browsers
- Node.js 24 LTS compatibility
- Mobile-responsive design

## License

MIT License - see LICENSE file for details.