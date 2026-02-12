# Build from workspace root with: docker build -f backend/Dockerfile -t guidebook-backend:latest .
# The build context must be the workspace root to access the models package

# Stage 1: Builder - Install dependencies
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy workspace structure (all package.json files needed for workspace resolution)
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY models/package.json ./models/

# Install production dependencies for backend and models workspaces only
RUN bun install --filter backend --filter models --frozen-lockfile --production

# Copy workspace source files
COPY models/ ./models/
COPY backend/ ./backend/

# Stage 2: Runtime - Use regular bun image for user management tools
FROM oven/bun:1

WORKDIR /app

# Install curl for docker-compose health checks (not needed in k8s)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

# Copy workspace with production dependencies from builder
COPY --from=builder --chown=appuser:appgroup /app /app

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

# Switch to non-root user
USER appuser

# Expose port 3000 (default Bun port)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "backend/src/index.ts"]
