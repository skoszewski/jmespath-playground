#!/bin/bash

# JMESPath Playground Upload Script
# Usage: ./upload.sh [-u URL] "json_file.json"

show_usage() {
    echo "Usage: $0 [-u|--url URL] <json_file>"
    echo ""
    echo "Options:"
    echo "  -u, --url URL    API URL (default: http://localhost:3000)"
    echo "  -h, --help       Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 data.json"
    echo "  $0 -u http://example.com:3000 data.json"
}

# Parse command line options
API_URL="http://localhost:3000"
JSON_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            API_URL="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        -*)
            echo "Error: Unknown option $1"
            show_usage
            exit 1
            ;;
        *)
            if [ -z "$JSON_FILE" ]; then
                JSON_FILE="$1"
            else
                echo "Error: Multiple JSON files specified"
                exit 1
            fi
            shift
            ;;
    esac
done

if [ -z "$JSON_FILE" ]; then
    echo "Error: JSON file required"
    show_usage
    exit 1
fi

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

echo "Uploading sample data to JMESPath Playground..."
echo "JSON file: $JSON_FILE"
echo "API URL: $API_URL"
echo

# Upload the JSON data
curl -s -X POST \
    -H "Content-Type: application/json" \
    --data @"$JSON_FILE" \
    "$API_URL/api/v1/upload"

echo
echo "Sample data uploaded successfully!"
echo "Open $API_URL in your browser to see the reload button."
echo "You can then enter your JMESPath expression in the web interface."