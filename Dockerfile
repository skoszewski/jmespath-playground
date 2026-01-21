# Build stage
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production + dev for build)
RUN npm ci

# Copy source code and build scripts
COPY src/ ./src/
COPY public/ ./public/
COPY scripts/ ./scripts/
COPY server.js ./server.js

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application and server from build stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js

# Expose port 3000
EXPOSE 3000

# Set LISTEN_ADDR to bind to all interfaces in container
ENV LISTEN_ADDR=0.0.0.0
ENV LISTEN_PORT=3000

# Start the integrated server
CMD ["node", "server.js"]