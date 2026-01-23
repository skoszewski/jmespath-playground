#!/usr/bin/env node

/**
 * JMESPath Playground Upload Script (JavaScript)
 * Usage: node upload.js [-u URL] [-k API_KEY] "json_file.json"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { parseArgs } = require('util');

function showUsage() {
    const scriptName = path.basename(process.argv[1]);
    console.log(`Usage: node ${scriptName} [-u|--url URL] [-k|--key API_KEY] <json_file>`);
    console.log('');
    console.log('Options:');
    console.log('  -u, --url URL        API URL (default: http://localhost:3000)');
    console.log('  -k, --key API_KEY    API key (not required for localhost)');
    console.log('  -h, --help           Show this help message');
    console.log('');
    console.log('Examples:');
    console.log(`  node ${scriptName} data.json`);
    console.log(`  node ${scriptName} -u http://example.com:3000 -k your-api-key data.json`);
}

function getArguments() {
    const { values, positionals } = parseArgs({
        args: process.argv.slice(2),
        options: {
            url: { type: 'string', short: 'u', default: 'http://localhost:3000' },
            key: { type: 'string', short: 'k' },
            help: { type: 'boolean', short: 'h' }
        },
        allowPositionals: true
    });

    if (values.help) {
        showUsage();
        process.exit(0);
    }

    if (positionals.length !== 1) {
        console.error('Error: JSON file required');
        showUsage();
        process.exit(1);
    }

    return {
        apiUrl: values.url,
        apiKey: values.key || '',
        jsonFile: positionals[0]
    };
}

async function validateJsonFile(jsonFile) {
    // Check if file exists
    if (!fs.existsSync(jsonFile)) {
        console.error(`Error: JSON file '${jsonFile}' not found`);
        process.exit(1);
    }

    // Validate JSON content
    try {
        const content = fs.readFileSync(jsonFile, 'utf8');
        JSON.parse(content);
        return content;
    } catch (error) {
        console.error(`Error: '${jsonFile}' contains invalid JSON`);
        console.error(error.message);
        process.exit(1);
    }
}

function isLocalhost(url) {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;
        return hostname === 'localhost' ||
               hostname === '127.0.0.1' ||
               hostname.startsWith('127.') ||
               hostname === '::1';
    } catch {
        return false;
    }
}

function makeRequest(url, options) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? https : http;

        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    json: () => Promise.resolve(JSON.parse(data))
                });
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

async function uploadData(apiUrl, apiKey, jsonFile, jsonData) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        // Only send API key for non-localhost requests
        const isLocal = isLocalhost(apiUrl);
        if (!isLocal && apiKey) {
            headers['X-API-Key'] = apiKey;
        } else if (!isLocal && !apiKey) {
            console.error('Error: API key required for non-localhost URLs');
            console.error('Use -k/--key option to specify API key');
            process.exit(1);
        }

        const response = await makeRequest(`${apiUrl}/api/v1/upload`, {
            method: 'POST',
            headers: headers,
            body: jsonData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Upload failed'}`);
        }

        const result = await response.json();
        console.log(JSON.stringify(result));

    } catch (error) {
        console.error('Error uploading data:', error.message);
        process.exit(1);
    }
}

async function main() {
    const { apiUrl, apiKey, jsonFile } = getArguments();
    const jsonData = await validateJsonFile(jsonFile);
    await uploadData(apiUrl, apiKey, jsonFile, jsonData);
}

// Run the script
main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});