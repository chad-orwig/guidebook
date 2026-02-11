# Production Deployment

## Overview

This epic will establish a repeatable deployment process for running the Guidebook Generator on a TrueNAS Scale instance. It will create deployment scripts and configuration files that package the application for TrueNAS, handle environment variables and secrets, and set up persistent storage for the MongoDB database and uploaded images. The result will be a documented, script-driven deployment workflow that can be easily repeated for updates and redeployments.

## Tasks

- [ ] Frontend Docker Image
- [ ] Backend Docker Image
- [ ] Kubernetes Manifest Spike
- [ ] Kustomize Templates
- [ ] Deployment Scripts
- [ ] Deployment Documentation

## Task Details

### 1. Frontend Docker Image

**Requirements:**
- Build production-optimized React SPA
- Choose and configure static file server (nginx, caddy, serve, or bun serve)
- Multi-stage Docker build (build stage + serve stage)
- Minimize final image size
- Health check endpoint for k8s probes
- Run as non-root user for security
- Proper handling of SPA routing (fallback to index.html)

### 2. Backend Docker Image

**Requirements:**
- Production Bun runtime environment
- Include only production dependencies
- Multi-stage build to exclude dev dependencies
- Health check endpoint for k8s probes
- Run as non-root user for security
- Environment variable configuration support
- Proper signal handling for graceful shutdown

### 3. Kubernetes Manifest Spike

**Requirements:**
- Single Pod with 3 containers (frontend, backend, mongodb)
- Frontend Service (ClusterIP or NodePort for ingress)
- Backend Service (ClusterIP for internal frontend->backend communication)
- Ingress resource to expose application externally
- PersistentVolumeClaim for MongoDB data persistence
- HostPath volumes for character image uploads
- ConfigMap for non-sensitive environment variables
- Secret for sensitive configuration (admin credentials, etc.)
- Resource limits for each container
- Liveness and readiness probes for frontend and backend
- Proper container port configuration
- Verify all components work together

### 4. Kustomize Templates

**Requirements:**
- Convert spike manifests to Kustomize structure
- Base manifests with common configuration
- ConfigMapGenerator for environment-specific settings
- SecretGenerator for sensitive values
- Image tag management and versioning
- Namespace configuration
- Label and annotation standardization
- Easy customization for different deployments

### 5. Deployment Scripts

**Requirements:**
- Build both Docker images with proper tagging
- Save/export Docker images to files
- Generate final k8s manifests from Kustomize templates
- Copy manifests to network-attached drive
- Exposed via top-level bun commands (e.g., `bun deploy:prepare`)
- Clear instructions output for manual TrueNAS steps
- Clear error messages and logging

### 6. Deployment Documentation

**Requirements:**
- Prerequisites (k3s access, kubectl, kustomize, docker)
- Initial setup steps (creating namespaces, secrets)
- How to run deployment scripts to prepare manifests
- Manual steps to run from inside TrueNAS (loading images, applying manifests)
- How to verify deployment status and pod health
- How to access the application (ingress URL, ports)
- How to update/redeploy the application
- Troubleshooting common issues
- Configuration reference for environment variables
- How to view logs and debug issues
- Backup and restore procedures for MongoDB data

## Implementation Details

### 1. Frontend Docker Image

**Technical Approach:**
- Create `frontend/Dockerfile` with multi-stage build
- **Stage 1 (Builder)**: Use `oven/bun:1` as base (Bun v1.x)
  - Copy entire workspace (needed for `@guidebook/models` dependency)
  - Run `bun install` from root to set up workspace
  - Run `bun run --filter frontend build` to build frontend
  - Output: Static files in `frontend/dist/`
- **Stage 2 (Runtime)**: Use `caddy:2-alpine` for production serving (Caddy v2.x)
  - Copy built static files from builder stage
  - Create Caddyfile for SPA routing (fallback to index.html)
  - Health check endpoint (Caddy returns 200 for `/`)
  - Run as non-root user (caddy user)
  - Expose port 80
- Create `.dockerignore` to exclude node_modules and build artifacts

### 2. Backend Docker Image

**Technical Approach:**
- Create `backend/Dockerfile` with multi-stage build
- **Stage 1 (Builder)**: Use `oven/bun:1` as base
  - Copy entire workspace (needed for `@guidebook/models` dependency)
  - Run `bun install --production --frozen-lockfile` for prod dependencies
  - Keep workspace structure intact for runtime
- **Stage 2 (Runtime)**: Use `oven/bun:1-slim` for smaller image
  - Copy workspace with production dependencies from builder
  - Add health check endpoint to Hono app (`/health` route)
  - Run as non-root user (create dedicated user)
  - Expose port 3000 (or configured port)
  - CMD: `bun run src/index.ts`
- Create `.dockerignore` to exclude unnecessary files

**Notes:**
- Bun handles graceful shutdown signals by default
- Environment variables passed via k8s ConfigMap/Secret

### 3. Kubernetes Manifest Spike

**Technical Approach:**
- Create `k8s/spike/` directory with individual manifest files
- **Namespace**: Create `guidebook` namespace
- **Pod** (`pod.yaml`):
  - Name: `guidebook-app`
  - Container 1 (frontend): Port 80, readiness/liveness HTTP probes on `/`
  - Container 2 (backend): Port 3000, readiness/liveness HTTP probes on `/health`
  - Container 3 (mongodb): Image `mongo:8`, Port 27017, liveness TCP probe, readiness mongo command
  - Volume mounts: MongoDB hostPath at `/data/db` (host: `/mnt/pool/guidebook/mongo`), images hostPath at `/app/uploads` (host: `/mnt/pool/guidebook/images`)
  - Resource limits: TBD based on testing (e.g., 500m CPU, 512Mi RAM per container)
  - Image pull policy: IfNotPresent (for local images)
- **Services**:
  - `service-frontend.yaml`: ClusterIP service, port 80, selector matches pod
  - `service-backend.yaml`: ClusterIP service, port 3000, selector matches pod
- **Ingress** (`ingress.yaml`):
  - Ingress class: traefik (TrueNAS Scale default)
  - Route traffic to frontend service
  - Host: `guidebook.orwig.app`
- **HostPath Volumes**:
  - MongoDB data: `/mnt/pool/guidebook/mongo` (must exist on TrueNAS host)
  - Character images: `/mnt/pool/guidebook/images` (must exist on TrueNAS host)
- **ConfigMap** (`configmap.yaml`):
  - Non-sensitive environment variables
  - MongoDB connection string (internal service)
  - API URLs, ports, etc.
- **Secret** (`secret.yaml`):
  - Admin username/password (base64 encoded)
  - MongoDB credentials if needed
  - Other sensitive values

**Testing:**
- Load images into k3s: `k3s ctr images import image.tar`
- Apply manifests: `kubectl apply -f k8s/spike/`
- Verify: `kubectl get pods -n guidebook`, check logs, test access

### 4. Kustomize Templates

**Technical Approach:**
- Convert spike manifests to Kustomize structure:
  ```
  k8s/
    base/
      kustomization.yaml
      namespace.yaml
      pod.yaml
      service-frontend.yaml
      service-backend.yaml
      ingress.yaml
    overlays/
      production/
        kustomization.yaml
        env.properties (for ConfigMap generation)
        .env.secret (for Secret generation, gitignored)
  ```
- **Base kustomization.yaml**:
  ```yaml
  apiVersion: kustomize.config.k8s.io/v1beta1
  kind: Kustomization
  namespace: guidebook
  resources:
    - namespace.yaml
    - pod.yaml
    - service-frontend.yaml
    - service-backend.yaml
    - ingress.yaml
  commonLabels:
    app: guidebook
  ```
- **Production overlay kustomization.yaml**:
  ```yaml
  apiVersion: kustomize.config.k8s.io/v1beta1
  kind: Kustomization
  bases:
    - ../../base
  configMapGenerator:
    - name: guidebook-env
      envs:
        - env.properties
  secretGenerator:
    - name: guidebook-secrets
      envs:
        - .env.secret
  images:
    - name: guidebook-frontend
      newTag: latest
    - name: guidebook-backend
      newTag: latest
  ```
- **env.properties**: Non-sensitive config (NODE_ENV, ports, etc.)
- **.env.secret**: Sensitive values (admin password, etc.) - gitignored
- Reference ConfigMap/Secret in pod.yaml using `envFrom`

**Notes:**
- Use `.gitignore` to exclude `.env.secret`
- Provide `.env.secret.example` with placeholder values
- Image tags can be updated per deployment

### 5. Deployment Scripts

**Technical Approach:**
- Add scripts to root `package.json`:
  ```json
  {
    "scripts": {
      "build:images": "bun run scripts/build-images.ts",
      "deploy:prepare": "bun run scripts/prepare-deployment.ts",
      "deploy:copy": "bun run scripts/copy-to-nas.ts"
    }
  }
  ```
- **build-images.ts**:
  - Build frontend image: `docker build -t guidebook-frontend:latest -f frontend/Dockerfile .`
  - Build backend image: `docker build -t guidebook-backend:latest -f backend/Dockerfile .`
  - Tag with version/commit hash if desired
  - Log progress and errors clearly
- **prepare-deployment.ts**:
  - Create `deploy/` directory
  - Save frontend image: `docker save guidebook-frontend:latest -o deploy/frontend.tar`
  - Save backend image: `docker save guidebook-backend:latest -o deploy/backend.tar`
  - Generate manifests: `kubectl kustomize k8s/overlays/production > deploy/manifests.yaml`
  - Create README in deploy/ with manual steps
- **copy-to-nas.ts**:
  - Copy `deploy/` contents to `/Volumes/guidebook/deploy`
  - Verify copy succeeded
  - Print next steps for user
- All scripts use Bun's native TypeScript support
- Include error handling and validation

### 6. Deployment Documentation

**Technical Approach:**
- Create `DEPLOYMENT.md` at repository root
- **Sections**:
  1. **Prerequisites**:
     - Docker installed locally
     - kubectl and kustomize installed (for local manifest generation)
     - Access to TrueNAS Scale shell
     - Network drive mounted
  2. **Initial Setup**:
     - Copy `.env.secret.example` to `.env.secret` in `k8s/overlays/production/`
     - Fill in actual secret values
     - Note: This file is gitignored for security
  3. **Building and Preparing Deployment**:
     - Run `bun build:images` to build Docker images
     - Run `bun deploy:prepare` to save images and generate manifests
     - Run `bun deploy:copy` to copy to network drive
  4. **Manual TrueNAS Steps**:
     - SSH into TrueNAS Scale
     - Navigate to deployment artifacts location
     - Load images: `k3s ctr images import frontend.tar backend.tar`
     - Apply manifests: `kubectl apply -f manifests.yaml`
     - Verify deployment: `kubectl get pods -n guidebook`
  5. **Accessing the Application**:
     - Get ingress info: `kubectl get ingress -n guidebook`
     - Access via configured hostname
     - Or use port-forward for testing: `kubectl port-forward -n guidebook pod/guidebook-app 8080:80`
  6. **Updates and Redeployment**:
     - Make code changes
     - Run deployment scripts again
     - On TrueNAS: delete old pod, load new images, apply manifests
     - Or use `kubectl rollout restart` if using Deployments instead of bare Pods
  7. **Troubleshooting**:
     - Check pod status: `kubectl describe pod -n guidebook guidebook-app`
     - View logs: `kubectl logs -n guidebook guidebook-app -c <container-name>`
     - Common issues: image pull failures, PVC not binding, ingress misconfiguration
  8. **Configuration Reference**:
     - Table of all environment variables
     - MongoDB connection details
     - Storage paths and volumes
  9. **Backup and Restore**:
     - Backup MongoDB: `kubectl exec -n guidebook guidebook-app -c mongodb -- mongodump ...`
     - Backup images: Copy hostPath volume
     - Restore procedures

**Format**: Clear markdown with code blocks and examples

