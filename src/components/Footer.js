import React from 'react';
import { VERSION } from '../version';

function Footer() {
  return (
    <footer className="bg-light border-top mt-2 py-2 flex-shrink-0">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0 text-muted small">
              <strong>JMESPath Testing Tool</strong> {VERSION === 'unknown' ? VERSION : `v${VERSION}`} - Created for testing and validating JMESPath expressions
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0 text-muted small">
              Licensed under <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="text-decoration-none">MIT License</a> |
              <a href="https://jmespath.org/" target="_blank" rel="noopener noreferrer" className="text-decoration-none ms-2">
                Learn JMESPath
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;