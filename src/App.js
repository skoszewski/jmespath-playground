import React, { useState, useEffect } from 'react';
import jmespath from 'jmespath';
import './App.css';

// JMESPath Testing Tool - Main Application Component
function App() {
  const [jmespathExpression, setJmespathExpression] = useState('people[0].name');
  const [jsonData, setJsonData] = useState(`{
  "people": [
    {
      "name": "John Doe",
      "age": 30,
      "city": "New York"
    },
    {
      "name": "Jane Smith",
      "age": 25,
      "city": "Los Angeles"
    }
  ],
  "total": 2
}`);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [jsonError, setJsonError] = useState('');

  const evaluateExpression = () => {
    try {
      // Clear previous errors
      setError('');
      setJsonError('');

      // Validate and parse JSON
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (jsonErr) {
        setJsonError(`Invalid JSON: ${jsonErr.message}`);
        setResult('');
        return;
      }

      // Evaluate JMESPath expression
      const queryResult = jmespath.search(parsedData, jmespathExpression);
      
      // Format the result
      if (queryResult === null || queryResult === undefined) {
        setResult('null');
      } else {
        setResult(JSON.stringify(queryResult, null, 2));
      }
    } catch (jmesErr) {
      setError(`JMESPath Error: ${jmesErr.message}`);
      setResult('');
    }
  };

  // Auto-evaluate when inputs change
  useEffect(() => {
    if (jmespathExpression && jsonData) {
      evaluateExpression();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jmespathExpression, jsonData]);

  const handleJmespathChange = (e) => {
    setJmespathExpression(e.target.value);
  };

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      setJsonData(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // If JSON is invalid, don't format
    }
  };

  const clearAll = () => {
    setJmespathExpression('');
    setJsonData('');
    setResult('');
    setError('');
    setJsonError('');
  };

  const loadSample = () => {
    setJmespathExpression('people[*].name');
    setJsonData(`{
  "people": [
    {
      "name": "Alice Johnson",
      "age": 28,
      "city": "Chicago",
      "skills": ["JavaScript", "React", "Node.js"]
    },
    {
      "name": "Bob Wilson",
      "age": 35,
      "city": "Seattle",
      "skills": ["Python", "Django", "PostgreSQL"]
    },
    {
      "name": "Carol Davis",
      "age": 32,
      "city": "Austin",
      "skills": ["Java", "Spring", "MySQL"]
    }
  ],
  "total": 3,
  "department": "Engineering"
}`);
  };

  const loadFromDisk = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            // Handle .json files as regular JSON
            JSON.parse(content); // Validate JSON
            setJsonData(content);
            setJsonError('');
          } catch (err) {
            setJsonError(`Invalid JSON file: ${err.message}`);
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  const loadLogFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.log';
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const lines = content.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            
            const jsonObjects = [];
            for (const line of lines) {
              try {
                const obj = JSON.parse(line);
                jsonObjects.push(obj);
              } catch (lineError) {
                throw new Error(`Invalid JSON on line: "${line.substring(0, 50)}..." - ${lineError.message}`);
              }
            }
            
            const jsonContent = JSON.stringify(jsonObjects, null, 2);
            setJsonData(jsonContent);
            setJsonError('');
          } catch (err) {
            setJsonError(`Invalid log file: ${err.message}`);
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      {/* Top Section: Title only */}
      <div className="header-section py-2">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="mb-1">JMESPath Testing Tool</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section - flex-grow to fill space */}
      <div className="container-fluid flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
        {/* Description paragraph */}
        <div className="row mb-2">
          <div className="col-12">
            <p className="text-muted text-center mb-2 small">
              Validate and test JMESPath expressions against JSON data in real-time.
              Enter your JMESPath query and JSON data below to see the results instantly.
            </p>
          </div>
        </div>

        {/* Middle Section: JMESPath Expression Input */}
        <div className="row mb-2">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center py-2">
                <h6 className="mb-0">
                  <i className="bi bi-search me-2"></i>
                  JMESPath Expression
                </h6>
                <div>
                  <button 
                    className="btn btn-outline-success btn-sm me-2" 
                    onClick={loadFromDisk}
                    title="Load JSON object from file"
                  >
                    📄 Load an Object
                  </button>
                  <button 
                    className="btn btn-outline-info btn-sm me-2" 
                    onClick={loadLogFile}
                    title="Load JSON Lines log file"
                  >
                    📋 Load a Log File
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-sm me-2" 
                    onClick={loadSample}
                    title="Load sample data"
                  >
                    Load Sample
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm me-2" 
                    onClick={formatJson}
                    title="Format JSON input for better readability"
                  >
                    Format JSON
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm" 
                    onClick={clearAll}
                    title="Clear all inputs"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="card-body">
                <input
                  type="text"
                  className={`form-control jmespath-input ${error ? 'error' : ''}`}
                  value={jmespathExpression}
                  onChange={handleJmespathChange}
                  placeholder="Enter JMESPath expression (e.g., people[*].name)"
                />
                {error && (
                  <div className="alert alert-danger mt-2 mb-0">
                    <small>{error}</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Middle Sections: JSON Data (left) and Query Result (right) */}
        <div className="row flex-grow-1" style={{ minHeight: 0 }}>
          {/* Lower Middle Left Section: JSON Data Input */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header py-2">
                <h6 className="mb-0">
                  <i className="bi bi-file-code me-2"></i>
                  JSON Data
                </h6>
              </div>
              <div className="card-body d-flex flex-column" style={{ minHeight: 0 }}>
                <div className="flex-grow-1" style={{ minHeight: 0 }}>
                  <textarea
                    className={`form-control h-100 json-input ${jsonError ? 'error' : ''}`}
                    value={jsonData}
                    onChange={handleJsonChange}
                    placeholder="Enter JSON data here..."
                    style={{ minHeight: 0, resize: 'none' }}
                  />
                </div>
                {jsonError && (
                  <div className="alert alert-danger mt-1 mb-0 py-1">
                    <small>{jsonError}</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lower Middle Right Section: Query Results Output */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header py-2">
                <h6 className="mb-0">
                  <i className="bi bi-arrow-right-circle me-2"></i>
                  Query Result
                </h6>
              </div>
              <div className="card-body d-flex flex-column" style={{ minHeight: 0 }}>
                <div className="flex-grow-1" style={{ minHeight: 0 }}>
                  <textarea
                    className={`form-control h-100 result-output ${result && !error && !jsonError ? 'success' : ''}`}
                    value={result}
                    readOnly
                    placeholder="Results will appear here..."
                    style={{ minHeight: 0, resize: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Footer */}
      <footer className="bg-light border-top mt-2 py-2 flex-shrink-0">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-0 text-muted small">
                <strong>JMESPath Testing Tool</strong> - Created for testing and validating JMESPath expressions
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0 text-muted small">
                Licensed under <a href="#" className="text-decoration-none">MIT License</a> | 
                <a href="https://jmespath.org/" target="_blank" rel="noopener noreferrer" className="text-decoration-none ms-2">
                  Learn JMESPath
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;