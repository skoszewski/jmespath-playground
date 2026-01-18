---
description: Instructions for using the JMESPath Testing Tool repository.
applyTo: "**/*.md,**/.js"
---
# AI Agent Instructions for JMESPath Testing Tool

The tool in this repository is designed to help users validate and test JMESPath expressions against JSON data. It is a React-based web application that provides an interactive interface for entering JMESPath queries and viewing the results.

The application is single page. The page is divided into three sections:

- Top section: Title and description of the tool.
- Middle section: Input area for JMESPath expressions
- Bottom left section: Input area for JSON data
- Bottom right section: Output are for JMESPath query results

The main components of the application are located in the `src` directory and target Node 24 LTS environment.

Framework to be used:

- React for building the user interface.
- JavaScript (ES6+) for scripting.
- Bootstrap for styling and layout.

## Containerization

The application should be prepared for deployment using containerization. It should extend minimal Node 24 LTS container image.

Do not assume the Docker is installed on the development machine.

The development machine is a MacOS system with Apple `container` command from @github/apple/container.

Build scripts should target MacOS with the above toolset as first class environment. Docker should be used only as secondary option.
