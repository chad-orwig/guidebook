# Build from workspace root with: docker build -f frontend/Dockerfile -t guidebook-frontend:latest .
# The build context must be the workspace root to access the models package

# Stage 1: Builder - Build the React application
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy workspace structure (all package.json files needed for workspace resolution)
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY models/package.json ./models/

# Install dependencies for frontend and models workspaces only
RUN bun install --filter frontend --filter models --frozen-lockfile

# Copy workspace source files
COPY models/ ./models/
COPY frontend/ ./frontend/

# Build the frontend
RUN bun run --filter frontend build

# Stage 2: Runtime - Serve with Caddy
FROM caddy:2-alpine

# Copy built static files from builder
COPY --from=builder /app/frontend/dist /srv

# Copy Caddyfile configuration
COPY frontend/Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Caddy runs as non-root by default
