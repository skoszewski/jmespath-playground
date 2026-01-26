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
                For remote clients, the API key is required for authentication. Define two
                environment variables in your <code>.bashrc</code>.
              </p>
              <pre className="bg-light p-3 rounded border">
              <code>export JMESPATH_PLAYGROUND_API_URL={window.location.origin}<br/>export JMESPATH_PLAYGROUND_API_KEY={apiKey}</code>
              </pre>
              <p className="text-muted">Then, use the following <code>curl</code> command to upload your data:</p>
              <pre className="bg-light p-3 rounded border">
<code>{`curl -s -X POST \\
    -H "Content-Type: application/json" \\
    -H "Accept: application/json" \\
    -H "X-API-Key: $JMESPATH_PLAYGROUND_API_KEY" \\
    --data @__JSON_FILE_NAME__ \\
    "$\{JMESPATH_PLAYGROUND_API_URL}/api/v1/upload"`}</code>
              </pre>
              <div className="form-text">
                Replace <code>{'__JSON_FILE_NAME__'}</code> with the path to your JSON file containing the sample data.
                or use <code>-</code> to read from standard input.
                <br />
                <strong>For localhost clients:</strong> The X-API-Key should be omitted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyPage;