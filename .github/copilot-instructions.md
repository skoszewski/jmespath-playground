---
description: Instructions for using the JMESPath Testing Tool repository.
applyTo: "**/*.md,**/.js"
---
# AI Agent Instructions for JMESPath Testing Tool

The tool in this repository is designed to help users validate and test JMESPath expressions against JSON data. It is a React-based web application that provides an interactive interface for entering JMESPath queries and viewing the results.

The application is single page. The page is divided into three sections:

- Top section: Title and description of the tool.
- Middle section:
  - Input area for JMESPath expressions
- Lower Middle left section: Input area for JSON data
- Lower Middle right section: Output are for JMESPath query results
- Boottom section: Footer with author and license information

The Middle section also contains a toolbar with buttons to load data from disk, load sample data, format JSON input, and clear all inputs.

The main components of the application are located in the `src` directory and target Node 24 LTS environment.

Framework to be used:

- React for building the user interface.
- JavaScript (ES6+) for scripting.
- Bootstrap for styling and layout.

## Containerization

The application should be prepared for deployment using containerization. It should extend minimal Node 24 LTS container image.
