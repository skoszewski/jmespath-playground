# Use Node 24 LTS as base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including serve for production)
RUN npm ci

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Install serve globally for production serving
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the application using serve directly
CMD ["serve", "-s", "build", "-l", "3000", "--host", "0.0.0.0"]