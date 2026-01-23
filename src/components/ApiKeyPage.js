import React, { useState } from 'react';

function ApiKeyPage({ apiKey, onRegenerateApiKey }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">🔐 API Key Management</h5>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label className="form-label fw-bold">Your API Key:</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={apiKey}
                  readOnly
                />
                <button
                  className={`btn ${copySuccess ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={handleCopyToClipboard}
                  title="Copy API key to clipboard"
                >
                  {copySuccess ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={onRegenerateApiKey}
                  title="Generate new API key"
                >
                  🔄 Regenerate
                </button>
              </div>
              <div className="form-text">
                This API key is used to encrypt and authenticate data uploads from remote clients.
                <strong>Note:</strong> Requests from localhost (127.0.0.1) do not require an API key.
              </div>
            </div>

            <div className="mb-4">
              <h6>📡 Remote Data Upload API</h6>
              <p className="text-muted">
                External tools can upload sample data remotely using the REST API.
                For remote clients, the API key is required for authentication:
              </p>
              <pre className="bg-light p-3 rounded border">
<code>{`curl -s -X POST \\
    -H "Content-Type: application/json" \\
    -H "Accept: application/json" \\
    -H "X-API-Key: ${apiKey}" \\
    --data @{{JSON_FILE_NAME}} \\
    "${window.location.origin}/api/v1/upload"`}</code>
              </pre>
              <div className="form-text">
                Replace <code>{'{{JSON_FILE_NAME}}'}</code> with the path to your JSON file containing the sample data.
                <br />
                <strong>For localhost clients:</strong> The X-API-Key header is optional and can be omitted.
              </div>
            </div>

            <div className="alert alert-info">
              <h6 className="alert-heading">ℹ️ How it works:</h6>
              <ul className="mb-0">
                <li>Remote clients require API key authentication for security</li>
                <li>Localhost clients (127.0.0.1) can access the API without authentication</li>
                <li>Your data is encrypted using AES-256-GCM with PBKDF2 key derivation</li>
                <li>Data is automatically cleared after first retrieval (one-time use)</li>
                <li>Sessions expire after 1 hour for security</li>
                <li>Maximum 100 concurrent sessions supported</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyPage;