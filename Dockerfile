# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies without running lifecycle scripts (e.g., husky prepare)
RUN npm ci --ignore-scripts

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS production

# Set Node.js to run in production mode
ENV NODE_ENV=production

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only, skip lifecycle scripts
RUN npm ci --omit=dev --ignore-scripts

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/newrelic.js ./newrelic.js

# Create a non-root user and set permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose the port your application runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
