#!/usr/bin/env node

/**
 * JMESPath Playground Upload Script (JavaScript)
 * Usage: node upload.js [-u URL] "json_file.json"
 */

const fs = require('fs');
const path = require('path');

function showUsage() {
    const scriptName = path.basename(process.argv[1]);
    console.log(`Usage: node ${scriptName} [-u|--url URL] <json_file>`);
    console.log('');
    console.log('Options:');
    console.log('  -u, --url URL    API URL (default: http://localhost:3000)');
    console.log('  -h, --help       Show this help message');
    console.log('');
    console.log('Example:');
    console.log(`  node ${scriptName} data.json`);
    console.log(`  node ${scriptName} -u http://example.com:3000 data.json`);
}

function parseArguments() {
    const args = process.argv.slice(2);
    let apiUrl = 'http://localhost:3000';
    let jsonFile = '';

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-u' || arg === '--url') {
            if (i + 1 >= args.length) {
                console.error('Error: URL argument required for -u/--url option');
                process.exit(1);
            }
            apiUrl = args[i + 1];
            i++; // Skip next argument
        } else if (arg === '-h' || arg === '--help') {
            showUsage();
            process.exit(0);
        } else if (arg.startsWith('-')) {
            console.error(`Error: Unknown option ${arg}`);
            showUsage();
            process.exit(1);
        } else {
            if (jsonFile) {
                console.error('Error: Multiple JSON files specified');
                process.exit(1);
            }
            jsonFile = arg;
        }
    }

    if (!jsonFile) {
        console.error('Error: JSON file required');
        showUsage();
        process.exit(1);
    }

    return { apiUrl, jsonFile };
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

async function uploadData(apiUrl, jsonFile, jsonData) {
    console.log('Uploading sample data to JMESPath Playground...');
    console.log(`JSON file: ${jsonFile}`);
    console.log(`API URL: ${apiUrl}`);
    console.log('');

    try {
        const response = await fetch(`${apiUrl}/api/v1/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Sample data uploaded successfully!');
        console.log(`Open ${apiUrl} in your browser to see the reload button.`);
        console.log('You can then enter your JMESPath expression in the web interface.');

    } catch (error) {
        console.error('Error uploading data:', error.message);
        process.exit(1);
    }
}

async function main() {
    const { apiUrl, jsonFile } = parseArguments();
    const jsonData = await validateJsonFile(jsonFile);
    await uploadData(apiUrl, jsonFile, jsonData);
}

// Run the script
main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});