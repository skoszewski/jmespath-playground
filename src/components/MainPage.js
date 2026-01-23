import React, { useState, useEffect } from 'react';
import jmespath from 'jmespath';

function MainPage({ apiKey, showReloadButton, onReloadSampleData, initialSampleData }) {
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

  // Use initial sample data when provided
  useEffect(() => {
    if (initialSampleData) {
      setJsonData(JSON.stringify(initialSampleData, null, 2));
    }
  }, [initialSampleData]);



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
    const sampleData = {
      "users": [
        {"name": "Alice", "age": 30, "city": "New York"},
        {"name": "Bob", "age": 25, "city": "San Francisco"},
        {"name": "Charlie", "age": 35, "city": "Chicago"}
      ],
      "total": 3
    };
    setJsonData(JSON.stringify(sampleData, null, 2));
    setJmespathExpression('users[?age > `30`].name');
  };

  const loadFromDisk = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const parsed = JSON.parse(content);
            setJsonData(JSON.stringify(parsed, null, 2));
          } catch (error) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const loadLogFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.log,.jsonl,.ndjson';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const lines = content.trim().split('\n');
            const logs = lines.map(line => JSON.parse(line));
            setJsonData(JSON.stringify(logs, null, 2));
            setJmespathExpression('[*].message');
          } catch (error) {
            alert('Invalid JSON Lines file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <>
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
                  title="Format JSON"
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
                className={`form-control jmespath-input ${error ? 'error' : 'success'}`}
                value={jmespathExpression}
                onChange={handleJmespathChange}
                placeholder="Enter JMESPath expression (e.g., people[*].name)"
              />
              <div className={`alert mt-2 mb-0 d-flex justify-content-between align-items-center ${error ? 'alert-danger' : 'alert-success'}`}>
                <small className="mb-0">{error || 'Expression is correct'}</small>
                {showReloadButton && (
                  <button
                    className="btn btn-light btn-sm ms-2 border"
                    onClick={() => {
                      onReloadSampleData();
                    }}
                    title="New sample data is available"
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reload Sample Data
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Middle Section: Input and Output Areas */}
      <div className="row flex-grow-1" style={{ minHeight: 0 }}>
        {/* Left Panel: JSON Data Input */}
        <div className="col-md-6">
          <div className="card h-100 d-flex flex-column">
            <div className="card-header py-2">
              <h6 className="mb-0">
                <i className="bi bi-file-earmark-code me-2"></i>
                JSON Data
              </h6>
            </div>
            <div className="card-body flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
              <textarea
                className={`form-control json-input flex-grow-1 ${jsonError ? 'error' : 'success'}`}
                value={jsonData}
                onChange={handleJsonChange}
                placeholder="Enter JSON data here..."
                style={{ minHeight: 0, resize: 'none' }}
              />
              {jsonError && (
                <div className="alert alert-danger mt-2 mb-0">
                  <small>{jsonError}</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="col-md-6">
          <div className="card h-100 d-flex flex-column">
            <div className="card-header py-2">
              <h6 className="mb-0">
                <i className="bi bi-output me-2"></i>
                Results
              </h6>
            </div>
            <div className="card-body flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
              <textarea
                className="form-control result-output flex-grow-1"
                value={result}
                readOnly
                placeholder="Results will appear here..."
                style={{ minHeight: 0, resize: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainPage;