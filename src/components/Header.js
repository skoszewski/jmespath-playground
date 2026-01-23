import React from 'react';

function Header({ theme, onThemeChange, currentPage, onPageChange }) {
  return (
    <div className="header-section py-2">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center position-relative">
            <h2 className="mb-1">JMESPath Testing Tool</h2>
            {/* Right side controls - better positioning */}
            <div className="position-absolute top-0 end-0 d-flex align-items-center gap-2">
              {/* API Key Management Button - more prominent */}
              <button
                type="button"
                className={`btn btn-sm ${
                  currentPage === 'apikey' 
                    ? 'btn-warning fw-bold' 
                    : 'btn-outline-warning'
                }`}
                onClick={() => onPageChange(currentPage === 'main' ? 'apikey' : 'main')}
                title="API Key Management"
              >
                🔐 API Keys
              </button>
              {/* Theme switcher with theme-aware classes */}
              <div className="btn-group btn-group-sm" role="group" aria-label="Theme switcher">
                <button
                  type="button"
                  className={`btn ${
                    theme === 'auto' 
                      ? 'btn-primary' 
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => onThemeChange('auto')}
                  title="Auto (follow system)"
                >
                  🌓 Auto
                </button>
                <button
                  type="button"
                  className={`btn ${
                    theme === 'light' 
                      ? 'btn-primary' 
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => onThemeChange('light')}
                  title="Light theme"
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  className={`btn ${
                    theme === 'dark' 
                      ? 'btn-primary' 
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => onThemeChange('dark')}
                  title="Dark theme"
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;