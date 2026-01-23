import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './components/MainPage';
import ApiKeyPage from './components/ApiKeyPage';
import './App.css';

// Utility function to generate a cryptographically secure API key
function generateApiKey() {
  const array = new Uint8Array(16);
  
  // Use crypto.getRandomValues if available (browser), fallback for tests
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for test environments - not cryptographically secure
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// JMESPath Testing Tool - Main Application Component
function App() {
  const [currentPage, setCurrentPage] = useState('main'); // 'main' or 'apikey'
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to 'auto'
    return localStorage.getItem('theme') || 'auto';
  });
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [currentStateGuid, setCurrentStateGuid] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [apiKey, setApiKey] = useState(() => {
    // Load API key from localStorage or generate new one
    const stored = localStorage.getItem('jmespath-api-key');
    if (stored && /^[0-9a-f]{32}$/i.test(stored)) {
      return stored;
    }
    const newKey = generateApiKey();
    localStorage.setItem('jmespath-api-key', newKey);
    return newKey;
  });

  // Theme management
  useEffect(() => {
    // Apply theme to document
    const applyTheme = (selectedTheme) => {
      const root = document.documentElement;
      const body = document.body;

      // Clear existing theme classes from both html and body
      root.className = '';
      body.classList.remove('theme-light', 'theme-dark');

      if (selectedTheme === 'light') {
        body.classList.add('theme-light');
      } else if (selectedTheme === 'dark') {
        body.classList.add('theme-dark');
      }
      // 'auto' uses CSS media queries (no class needed)
    };

    applyTheme(theme);
    
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check if we're running on localhost
  const isRunningOnLocalhost = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.startsWith('127.') || 
           hostname === '::1';
  };

  // Get headers for API requests (omit API key for localhost)
  const getApiHeaders = () => {
    const headers = {
      'Accept': 'application/json'
    };
    
    // Only send API key for non-localhost requests
    if (!isRunningOnLocalhost()) {
      headers['X-API-Key'] = apiKey;
    }
    
    return headers;
  };

  // Load sample data from API on startup and setup periodic state checking
  useEffect(() => {
    loadSampleData();

    // Check for state changes every 5 seconds
    const interval = setInterval(checkStateChange, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Check if state has changed (new data uploaded)
  const checkStateChange = async () => {
    try {
      const response = await fetch('/api/v1/state', {
        headers: getApiHeaders()
      });
      
      if (response.ok) {
        const stateData = await response.json();
        if (stateData.state && stateData.state !== currentStateGuid) {
          setShowReloadButton(true);
        }
      }
    } catch (error) {
      // Silently handle state check errors
      console.log('State check failed:', error);
    }
  };

  // Load sample data from API
  const loadSampleData = async () => {
    try {
      setShowReloadButton(false);
      const response = await fetch('/api/v1/sample', {
        headers: getApiHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSampleData(data);
          console.log('Sample data loaded:', data);
        }

        // Update current state GUID
        const stateResponse = await fetch('/api/v1/state', {
          headers: getApiHeaders()
        });
        if (stateResponse.ok) {
          const stateData = await stateResponse.json();
          setCurrentStateGuid(stateData.state);
        }
      }
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  };

  // Regenerate API key
  const regenerateApiKey = () => {
    const newKey = generateApiKey();
    setApiKey(newKey);
    localStorage.setItem('jmespath-api-key', newKey);
    setShowReloadButton(false);
    setCurrentStateGuid(null);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <Header 
        theme={theme}
        onThemeChange={handleThemeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Main Content Section - flex-grow to fill space */}
      <div className="container-fluid flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
        {currentPage === 'main' ? (
          <MainPage 
            apiKey={apiKey}
            showReloadButton={showReloadButton}
            onReloadSampleData={loadSampleData}
            initialSampleData={sampleData}
          />
        ) : (
          <ApiKeyPage 
            apiKey={apiKey}
            onRegenerateApiKey={regenerateApiKey}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;