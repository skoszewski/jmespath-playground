# Use Node 24 LTS as base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy server code
COPY server.js ./server.js

# Copy built application
COPY build/ ./build/

# Expose port 3000
EXPOSE 3000

# Set LISTEN_ADDR to bind to all interfaces in container
ENV LISTEN_ADDR=0.0.0.0
ENV LISTEN_PORT=3000

# Start the integrated server
CMD ["node", "server.js"]