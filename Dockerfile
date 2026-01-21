# Use Node 24 LTS as base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production + dev for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY server.js ./server.js

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose port 3000
EXPOSE 3000

# Set LISTEN_ADDR to bind to all interfaces in container
ENV LISTEN_ADDR=0.0.0.0
ENV LISTEN_PORT=3000

# Start the integrated server
CMD ["node", "server.js"]