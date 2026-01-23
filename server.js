const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create Express app
function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'build')));

  // In-memory storage
  let sampleData = {
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
  };

  let stateGuid = uuidv4();

  // API endpoints
  app.post('/api/v1/upload', (req, res) => {
    try {
      const uploadedData = req.body;

      // Validate that it's valid JSON
      if (!uploadedData || typeof uploadedData !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON data' });
      }

      // Store the sample data and generate new state GUID
      sampleData = uploadedData;
      stateGuid = uuidv4();

      res.json({ message: 'Sample data uploaded successfully', state: stateGuid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload sample data' });
    }
  });

  app.get('/api/v1/sample', (req, res) => {
    try {
      const dataToReturn = sampleData;

      // Security: Clear the sample data after it's retrieved (one-time use)
      sampleData = null;
      console.log('📤 Sample data retrieved and cleared from server memory');

      res.json(dataToReturn);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve sample data' });
    }
  });

  app.get('/api/v1/state', (req, res) => {
    try {
      res.json({ state: stateGuid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve state' });
    }
  });

  // Serve React app for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  return app;
}

// Start server if this file is run directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let listenAddr = process.env.LISTEN_ADDR || '127.0.0.1';
  let listenPort = process.env.LISTEN_PORT || 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-h' || args[i] === '--listen-addr') {
      listenAddr = args[i + 1];
      i++;
    } else if (args[i] === '-p' || args[i] === '--port') {
      listenPort = args[i + 1];
      i++;
    }
  }

  const app = createApp();
  const PORT = parseInt(listenPort);
  const HOST = listenAddr;

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  POST http://${HOST}:${PORT}/api/v1/upload`);
    console.log(`  GET  http://${HOST}:${PORT}/api/v1/sample`);
    console.log(`  GET  http://${HOST}:${PORT}/api/v1/state`);
  });
}

module.exports = { createApp };