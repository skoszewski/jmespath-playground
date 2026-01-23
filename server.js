const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Environment configuration
const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS) || 100;
const MAX_SAMPLE_SIZE = parseInt(process.env.MAX_SAMPLE_SIZE) || 1024 * 1024; // 1MB
const MAX_SESSION_TTL = parseInt(process.env.MAX_SESSION_TTL) || 60 * 60 * 1000; // 1 hour

// Utility functions for encryption
function generateSalt() {
  return crypto.randomBytes(16);
}

function isLocalhostRequest(req) {
  // Get client IP with fallback options
  const forwarded = req.get('X-Forwarded-For');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             '127.0.0.1';
  
  const host = req.get('host') || '';
  
  // Check for localhost IP addresses (IPv4 and IPv6)
  const localhostIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];
  const isLocalIP = localhostIPs.includes(ip) || ip.startsWith('127.') || ip === '::1';
  
  // Check for localhost hostnames
  const isLocalHost = host.startsWith('localhost:') || host.startsWith('127.0.0.1:') || host === 'localhost' || host === '127.0.0.1';
  
  return isLocalIP || isLocalHost;
}

function encrypt(data, key) {
  try {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAAD(Buffer.from('session-data'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted.toString('hex'),
      tag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('⚠️ Encryption exception:', {
      message: error.message,
      algorithm: 'aes-256-gcm',
      keyLength: key ? key.length : 'undefined',
      timestamp: new Date().toISOString()
    });
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

function decrypt(encryptedObj, key) {
  try {
    const algorithm = 'aes-256-gcm';
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAAD(Buffer.from('session-data'));
    decipher.setAuthTag(Buffer.from(encryptedObj.tag, 'hex'));
    
    let decrypted = decipher.update(Buffer.from(encryptedObj.data, 'hex'), null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('⚠️ Decryption exception:', {
      message: error.message,
      algorithm: 'aes-256-gcm',
      keyLength: key ? key.length : 'undefined',
      hasIV: !!encryptedObj.iv,
      hasTag: !!encryptedObj.tag,
      hasData: !!encryptedObj.data,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// For localhost requests, use a consistent API key so sessions persist
const LOCALHOST_API_KEY = 'localhost0123456789abcdef0123456789';

function isValidApiKey(apiKey) {
  return typeof apiKey === 'string' && /^[0-9a-f]{32}$/i.test(apiKey);
}

function getSessionId(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(32);
}

function deriveKey(apiKey, salt) {
  return crypto.pbkdf2Sync(apiKey, salt, 10000, 32, 'sha256');
}

// Create Express app
function createApp() {
  const app = express();

  // Trust proxy to get real client IP (needed for localhost detection)
  app.set('trust proxy', true);

  // Middleware
  app.use(express.json({ limit: MAX_SAMPLE_SIZE }));
  app.use(express.static(path.join(__dirname, 'build')));

  // Session storage
  const sessions = new Map();

  // Cleanup expired sessions
  function cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
      if (now - session.createdAt > MAX_SESSION_TTL) {
        sessions.delete(sessionId);
        console.log(`🧹 Cleaned up expired session: ${sessionId.substring(0, 8)}...`);
      }
    }
  }

  // Run cleanup every 5 minutes
  setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

  // API endpoints
  app.post('/api/v1/upload', (req, res) => {
    try {
      // Check if request is from localhost - if so, skip API key validation
      const isFromLocalhost = isLocalhostRequest(req);
      let apiKey = req.headers['x-api-key'];
      
      if (!isFromLocalhost) {
        // Validate API key header for remote clients
        if (!apiKey || !isValidApiKey(apiKey)) {
          return res.status(403).json({ error: 'Invalid or missing X-API-Key header' });
        }
      } else {
        // For localhost requests, use consistent API key for session persistence
        if (!apiKey || !isValidApiKey(apiKey)) {
          apiKey = LOCALHOST_API_KEY;
        }
      }

      // Cleanup expired sessions before checking limits
      cleanupExpiredSessions();

      // Check session limits
      if (sessions.size >= MAX_SESSIONS) {
        return res.status(429).json({ 
          error: 'Maximum number of sessions reached. Please try again later.',
          maxSessions: MAX_SESSIONS,
          currentSessions: sessions.size
        });
      }

      const uploadedData = req.body;

      // Validate that it's valid JSON
      if (!uploadedData || typeof uploadedData !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON data' });
      }

      // Check data size
      const dataSize = Buffer.byteLength(JSON.stringify(uploadedData), 'utf8');
      if (dataSize > MAX_SAMPLE_SIZE) {
        return res.status(413).json({ 
          error: 'Sample data too large',
          maxSize: MAX_SAMPLE_SIZE,
          receivedSize: dataSize
        });
      }

      const sessionId = getSessionId(apiKey);
      const salt = generateSalt();
      const key = deriveKey(apiKey, salt);
      const stateGuid = uuidv4();

      // Encrypt and store session data
      const encryptedData = encrypt(uploadedData, key);
      
      sessions.set(sessionId, {
        salt: salt.toString('hex'),
        encryptedData,
        state: stateGuid,
        createdAt: Date.now(),
        accessed: false
      });

      console.log(`📁 Session created: ${sessionId.substring(0, 8)}... (${sessions.size}/${MAX_SESSIONS})`);

      res.json({ 
        message: 'Sample data uploaded successfully', 
        state: stateGuid,
        sessionId: sessionId.substring(0, 8) + '...'
      });
    } catch (error) {
      console.error('⚠️ Upload endpoint exception occurred:', {
        message: error.message,
        stack: error.stack,
        sessionCount: sessions.size,
        timestamp: new Date().toISOString()
      });
      
      // Provide more specific error messages based on error type
      if (error.name === 'SyntaxError') {
        return res.status(400).json({ 
          error: 'Invalid JSON data format',
          details: 'The uploaded data could not be parsed as valid JSON'
        });
      } else if (error.message.includes('encrypt')) {
        return res.status(500).json({ 
          error: 'Encryption failed',
          details: 'Failed to encrypt session data. Please try again with a new API key.'
        });
      } else if (error.message.includes('PBKDF2')) {
        return res.status(500).json({ 
          error: 'Key derivation failed',
          details: 'Failed to derive encryption key from API key'
        });
      } else {
        return res.status(500).json({ 
          error: 'Upload processing failed',
          details: 'An unexpected error occurred while processing your upload. Please try again.'
        });
      }
    }
  });

  app.get('/api/v1/sample', (req, res) => {
    try {
      // Check if request is from localhost - if so, skip API key validation
      const isFromLocalhost = isLocalhostRequest(req);
      let apiKey = req.headers['x-api-key'];
      
      if (!isFromLocalhost) {
        // Validate API key header for remote clients
        if (!apiKey || !isValidApiKey(apiKey)) {
          return res.status(403).json({ error: 'Invalid or missing X-API-Key header' });
        }
      } else {
        // For localhost requests, use consistent API key for session persistence
        if (!apiKey || !isValidApiKey(apiKey)) {
          apiKey = LOCALHOST_API_KEY;
        }
      }

      const sessionId = getSessionId(apiKey);
      const session = sessions.get(sessionId);

      if (!session) {
        return res.json(null);
      }

      // Decrypt data
      const salt = Buffer.from(session.salt, 'hex');
      const key = deriveKey(apiKey, salt);
      const decryptedData = decrypt(session.encryptedData, key);

      // Remove session after first access (one-time use)
      sessions.delete(sessionId);
      console.log(`📤 Sample data retrieved and session cleared: ${sessionId.substring(0, 8)}...`);

      res.json(decryptedData);
    } catch (error) {
      console.error('⚠️ Sample retrieval exception occurred:', {
        message: error.message,
        stack: error.stack,
        sessionCount: sessions.size,
        timestamp: new Date().toISOString()
      });
      
      // Provide more specific error messages based on error type
      if (error.message.includes('decrypt')) {
        return res.status(500).json({ 
          error: 'Decryption failed',
          details: 'Failed to decrypt session data. The session may be corrupted or the API key may be incorrect.'
        });
      } else if (error.message.includes('JSON')) {
        return res.status(500).json({ 
          error: 'Data corruption detected',
          details: 'The stored session data appears to be corrupted and cannot be parsed.'
        });
      } else if (error.name === 'TypeError') {
        return res.status(500).json({ 
          error: 'Session data format error',
          details: 'The session data format is invalid or corrupted.'
        });
      } else {
        return res.status(500).json({ 
          error: 'Sample retrieval failed',
          details: 'An unexpected error occurred while retrieving sample data. The session may have been corrupted.'
        });
      }
    }
  });

  app.get('/api/v1/state', (req, res) => {
    try {
      // Check if request is from localhost - if so, skip API key validation
      const isFromLocalhost = isLocalhostRequest(req);
      let apiKey = req.headers['x-api-key'];
      
      if (!isFromLocalhost) {
        // Validate API key header for remote clients
        if (!apiKey || !isValidApiKey(apiKey)) {
          return res.status(403).json({ error: 'Invalid or missing X-API-Key header' });
        }
      } else {
        // For localhost requests, use consistent API key for session persistence
        if (!apiKey || !isValidApiKey(apiKey)) {
          apiKey = LOCALHOST_API_KEY;
        }
      }

      const sessionId = getSessionId(apiKey);
      const session = sessions.get(sessionId);

      if (!session) {
        // Return null state when no session exists
        return res.json({ state: null });
      }

      res.json({ state: session.state });
    } catch (error) {
      console.error('⚠️ State retrieval exception occurred:', {
        message: error.message,
        stack: error.stack,
        sessionCount: sessions.size,
        timestamp: new Date().toISOString()
      });
      
      // Provide more specific error messages
      if (error.message.includes('API key')) {
        return res.status(403).json({ 
          error: 'API key processing failed',
          details: 'Failed to process the provided API key'
        });
      } else {
        return res.status(500).json({ 
          error: 'State retrieval failed',
          details: 'An unexpected error occurred while retrieving session state. Please try again.'
        });
      }
    }
  });

  // Health endpoint (no auth required)
  app.get('/api/v1/health', (req, res) => {
    cleanupExpiredSessions(); // Cleanup on health check
    res.json({
      status: 'healthy',
      sessions: {
        current: sessions.size,
        max: MAX_SESSIONS,
        available: MAX_SESSIONS - sessions.size
      },
      limits: {
        maxSessions: MAX_SESSIONS,
        maxSampleSize: MAX_SAMPLE_SIZE,
        maxSessionTTL: MAX_SESSION_TTL
      },
      uptime: process.uptime()
    });
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
    console.log(`🚀 JMESPath Playground Server running on http://${HOST}:${PORT}`);
    console.log(`📊 Configuration:`);
    console.log(`   Max Sessions: ${MAX_SESSIONS}`);
    console.log(`   Max Sample Size: ${(MAX_SAMPLE_SIZE / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Session TTL: ${(MAX_SESSION_TTL / 1000 / 60).toFixed(0)} minutes`);
    console.log(`🔗 API endpoints:`);
    console.log(`   POST http://${HOST}:${PORT}/api/v1/upload (requires X-API-Key)`);
    console.log(`   GET  http://${HOST}:${PORT}/api/v1/sample (requires X-API-Key)`);
    console.log(`   GET  http://${HOST}:${PORT}/api/v1/state (requires X-API-Key)`);
    console.log(`   GET  http://${HOST}:${PORT}/api/v1/health (public)`);
    console.log(`🔐 Security: AES-256-GCM encryption with PBKDF2 key derivation`);
  });
}

module.exports = { createApp };