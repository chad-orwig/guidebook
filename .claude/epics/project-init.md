# Epic: Project Init

## Overview
This epic establishes the foundational project structure and local development environment for the guidebook generator application. It creates separate frontend and backend projects with the chosen tech stack (React, Hono, MongoDB, Bun), configures hot reload and linting, and sets up local data layer. The deliverable is a working local development environment where frontend, backend, and database can run with hot reload and code quality tooling.

## Tasks

- [x] 1. Initialize Frontend Project
- [x] 2. Initialize Backend Project
- [x] 3. Setup Local MongoDB
- [x] 4. Configure Hot Reload
- [x] 5. Setup Linting

### 1. Initialize Frontend Project
**Requirements:**
- React application with TypeScript
- Vite bundler configured for Bun
- shadcn/ui and Tailwind CSS installed and configured
- Project structure (src/, components/, pages/, etc.)
- Package.json with all frontend dependencies

**Implementation:**
1. Create Vite project: `bun create vite frontend` (select React + TypeScript)
2. Install Tailwind: `bun add tailwindcss @tailwindcss/vite`
3. Replace `src/index.css` with `@import "tailwindcss";`
4. Update `tsconfig.json` with baseUrl "." and paths `"@/*": ["./src/*"]`
5. Apply same config to `tsconfig.app.json`
6. Install node types: `bun add -D @types/node`
7. Update `vite.config.ts` to import path, add tailwindcss plugin, and configure path alias
8. Initialize shadcn: `bunx shadcn@latest init`
9. Create additional folders: src/pages/, src/hooks/, src/lib/

### 2. Initialize Backend Project
**Requirements:**
- Hono server with TypeScript
- Project structure (routes/, middleware/, models/, etc.)
- Package.json with backend dependencies
- Environment variable configuration (.env support)
- Basic health check endpoint

**Implementation:**
1. Create Hono project: `bun create hono backend`
2. Install dotenv support: `bun add dotenv`
3. Create folder structure: src/routes/, src/middleware/, src/models/, src/lib/
4. Add health check endpoint: GET `/health` returning status and timestamp
5. Create `.env.example` file with MongoDB connection string template
6. Configure environment variable loading in entry point
7. Update tsconfig.json if needed for path aliases

### 3. Setup Local MongoDB
**Requirements:**
- Local MongoDB instance running (via Docker or local install)
- MongoDB connection configuration in backend
- Database initialization script
- Connection test from backend
- Environment variables for connection string

**Implementation:**
1. Create `docker-compose.yml` at project root with MongoDB service (port 27017)
2. In backend: Install MongoDB driver: `bun add mongodb`
3. In backend: Create `src/lib/db.ts` with MongoDB connection logic
4. In backend: Add to `.env`: `MONGODB_URI=mongodb://localhost:27017/guidebook`
5. In backend: Create database initialization function to test connection
6. In backend: Add connection call in server startup (`src/index.ts`)
7. In backend: Log successful connection or error on startup

### 4. Configure Hot Reload
**Requirements:**
- Frontend auto-reloads on file changes
- Backend auto-restarts on file changes
- Development scripts to run both services concurrently
- Clear console output showing reload status

**Implementation:**
1. Frontend: Verify Vite dev script has hot reload (should be default)
2. Backend: Verify `bun create hono` sets up hot reload in dev script
3. If backend needs hot reload: add `--watch` flag to dev script
4. Project root: Create `package.json` with workspace configuration
5. Project root: Install concurrently: `bun add -D concurrently`
6. Project root: Add dev script: `"dev": "concurrently \"bun --cwd frontend run dev\" \"bun --cwd backend run dev\""`
7. Test hot reload by making changes to both services

### 5. Setup Linting
**Requirements:**
- ESLint configured for TypeScript
- Prettier for code formatting
- Shared linting rules across frontend and backend
- Editor integration configuration (VSCode settings)
- Lint scripts in package.json

**Implementation:**
1. Project root: Install shared deps: `bun add -D eslint prettier eslint-config-prettier`
2. Project root: Create `.eslintrc.json` with base TypeScript rules
3. Project root: Create `.prettierrc` with formatting rules
4. Frontend: Extend root ESLint config, add React-specific rules
5. Backend: Extend root ESLint config, add Node-specific rules
6. Project root: Create `.vscode/settings.json` with format on save, ESLint integration
7. Add lint scripts to frontend, backend, and root package.json
8. Project root: Add `"lint": "bun --cwd frontend run lint && bun --cwd backend run lint"`
