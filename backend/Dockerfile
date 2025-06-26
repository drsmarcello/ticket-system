# Production-ready Dockerfile for Ticket Management Backend
FROM node:18-alpine AS dependencies

WORKDIR /app

# Install system dependencies for health checks
RUN apk add --no-cache curl

# Copy package files for dependency installation
COPY package*.json ./
COPY prisma/ ./prisma/

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy configuration files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Generate Prisma Client and build TypeScript
RUN npx prisma generate && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Copy production dependencies and built application
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Set correct ownership
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 4000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Start application with database migration
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]