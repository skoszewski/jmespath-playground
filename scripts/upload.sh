#!/bin/bash

# JMESPath Playground Upload Script
# Usage: ./upload.sh "json_file.json"

if [ $# -ne 1 ]; then
    echo "Usage: $0 <json_file>"
    echo "Example: $0 data.json"
    exit 1
fi

JSON_FILE="$1"

if [ ! -f "$JSON_FILE" ]; then
    echo "Error: JSON file '$JSON_FILE' not found"
    exit 1
fi

# Validate JSON with jq if available
if command -v jq >/dev/null 2>&1; then
    if ! jq . "$JSON_FILE" >/dev/null 2>&1; then
        echo "Error: '$JSON_FILE' contains invalid JSON"
        exit 1
    fi
fi

JSON_DATA=$(cat "$JSON_FILE")
API_URL="${API_URL:-http://localhost:3000}"

echo "Uploading sample data to JMESPath Playground..."
echo "JSON file: $JSON_FILE"
echo "API URL: $API_URL"
echo

# Upload the JSON data
curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA" \
    "$API_URL/api/v1/upload"

echo
echo "Sample data uploaded successfully!"
echo "Open $API_URL in your browser to see the reload button."
echo "You can then enter your JMESPath expression in the web interface."