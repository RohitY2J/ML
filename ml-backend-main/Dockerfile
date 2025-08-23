# Use Node.js 18 for better compatibility
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Ensure TypeScript is available and build the application
RUN npx tsc --version
RUN npm run build

# Verify the build output exists
RUN ls -la dist/

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application (build first if dist doesn't exist)
CMD ["sh", "-c", "npm run build && npm start"] 


