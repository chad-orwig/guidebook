# Deployment Guide

This guide covers deploying the Guidebook application to TrueNAS Scale using Kubernetes (k3s).

## Prerequisites

### Local Development Machine
- **Docker**: For building images
- **Kustomize v5+**: Installed via `brew install kustomize`
- **Bun**: For running deployment scripts
- **SMB Access**: Network drive mounted at `/Volumes/guidebook`

### TrueNAS Scale Server
- **k3s**: Pre-installed with TrueNAS Scale
- **kubectl**: Bundled with k3s (accessed via `sudo k3s kubectl`)
- **Traefik**: Ingress controller (pre-configured)
- **cert-manager**: For TLS certificates (pre-configured with ClusterIssuer `main`)
- **SSH Access**: Ability to SSH into TrueNAS server

### Required Directories on TrueNAS
```bash
/mnt/pool/guidebook/mongo     # MongoDB data (owned by uid 999)
/mnt/pool/guidebook/images    # Character images (owned by uid 1001)
/mnt/pool/guidebook/manifests # Deployment manifests (any owner)
```

## Initial Setup

### 1. Create Secret on Cluster (One-Time)

Secrets are managed manually on the TrueNAS cluster and NOT stored locally or in source control.

**Create the secret on TrueNAS:**

```bash
# SSH into TrueNAS
ssh truenas

# Generate a secure auth secret (32+ characters)
AUTH_SECRET=$(openssl rand -base64 32)

# Create the secret
sudo k3s kubectl create secret generic guidebook-secrets \
  --namespace=guidebook \
  --from-literal=BETTER_AUTH_SECRET="$AUTH_SECRET" \
  --from-literal=ADMIN_USERNAME="your_admin_username" \
  --from-literal=ADMIN_PASSWORD="your_secure_password"

# Label the secret so it's not pruned
sudo k3s kubectl label secret guidebook-secrets \
  --namespace=guidebook \
  app=guidebook \
  environment=production
```

**Important**: Store these credentials securely (password manager, etc.). They are NOT in source control.

### 2. Create Host Directories (One-Time Setup)

On TrueNAS, ensure directories exist with correct permissions:

```bash
# SSH into TrueNAS
ssh truenas

# Create directories
sudo mkdir -p /mnt/pool/guidebook/mongo
sudo mkdir -p /mnt/pool/guidebook/images
sudo mkdir -p /mnt/pool/guidebook/manifests

# Set ownership (critical for non-root containers)
sudo chown -R 999:999 /mnt/pool/guidebook/mongo      # MongoDB user
sudo chown -R 1001:1001 /mnt/pool/guidebook/images   # Backend appuser
sudo chmod -R 755 /mnt/pool/guidebook
```

## Deployment Workflow

### Step 1: Build Docker Images

Build multi-platform images and push to Docker Hub:

```bash
# Build and push both images (AMD64 + ARM64)
bun run docker:push

# OR for AMD64 only (if buildx not configured)
bun run docker:push-amd64
```

**Images created:**
- `edgethio/guidebook-frontend:latest`
- `edgethio/guidebook-backend:latest`

### Step 2: Prepare Manifests

Generate Kubernetes manifests and copy to SMB share:

```bash
bun run deploy:prepare
```

**This script:**
1. Generates manifests using `kustomize build k8s/overlays/production`
2. Checks that SMB share is mounted at `/Volumes/guidebook`
3. Clears the manifests directory
4. Writes `manifests.yaml` to `/Volumes/guidebook/manifests/`
5. Generates executable `deploy.sh` script for TrueNAS
6. Displays next steps

### Step 3: Deploy to TrueNAS

SSH into TrueNAS and run the deployment script:

```bash
# SSH into TrueNAS
ssh truenas

# Navigate to manifests directory
cd /mnt/pool/guidebook/manifests

# Run deployment script
sudo ./deploy.sh
```

**The deploy.sh script:**
- Applies manifests with `kubectl apply`
- Uses `--prune -l app=guidebook` to automatically remove deleted resources
- Shows deployment status
- Displays running pods

## Verification

### Check Pod Status

```bash
# View all pods in guidebook namespace
sudo k3s kubectl get pods -n guidebook

# Expected output:
# NAME                             READY   STATUS    RESTARTS   AGE
# guidebook-app-xxxxxxxxxx-xxxxx   3/3     Running   0          30s
```

All 3 containers (frontend, backend, mongodb) should be `Running` and `READY 3/3`.

### Check Services

```bash
sudo k3s kubectl get services -n guidebook

# Expected:
# guidebook-frontend   ClusterIP   10.x.x.x   <none>   80/TCP     1m
# guidebook-backend    ClusterIP   10.x.x.x   <none>   3000/TCP   1m
```

### Check Ingress

```bash
sudo k3s kubectl get ingress -n guidebook

# Should show:
# NAME                CLASS    HOSTS                   ADDRESS      PORTS
# guidebook-ingress   <none>   guidebook.orwig.app     10.x.x.x     80, 443
```

### Access Application

The application should be accessible at:
- **Production URL**: https://guidebook.orwig.app

**Initial Login:**
- Username: (from your cluster secret)
- Password: (from your cluster secret)

## Updating the Application

### Update Application Code

After making code changes:

```bash
# 1. Build and push new images
bun run docker:push

# 2. Regenerate manifests
bun run deploy:prepare

# 3. Deploy to TrueNAS
ssh truenas
cd /mnt/pool/guidebook/manifests
sudo ./deploy.sh
```

The deployment uses `Recreate` strategy, so it will:
1. Terminate the old pod
2. Wait for termination to complete
3. Start the new pod with updated images

### Update Configuration

To change non-sensitive settings (URLs, ports, etc.):

```bash
# 1. Edit configuration file
vim k8s/overlays/production/env.properties

# 2. Regenerate and deploy
bun run deploy:prepare
ssh truenas
cd /mnt/pool/guidebook/manifests
sudo ./deploy.sh

# 3. Manually restart deployment (hash suffixes disabled)
sudo k3s kubectl rollout restart deployment/guidebook-app -n guidebook
```

### Update Secrets

Secrets are managed manually on the cluster. To update them:

```bash
# SSH into TrueNAS
ssh truenas

# Update individual secret values
sudo k3s kubectl patch secret guidebook-secrets \
  --namespace=guidebook \
  --type=json \
  -p='[{"op": "replace", "path": "/data/ADMIN_PASSWORD", "value": "'$(echo -n "new_password" | base64)'"}]'

# OR delete and recreate the entire secret
sudo k3s kubectl delete secret guidebook-secrets --namespace=guidebook

sudo k3s kubectl create secret generic guidebook-secrets \
  --namespace=guidebook \
  --from-literal=BETTER_AUTH_SECRET="your_secret_here" \
  --from-literal=ADMIN_USERNAME="your_username" \
  --from-literal=ADMIN_PASSWORD="your_password"

# Label it so it's not pruned
sudo k3s kubectl label secret guidebook-secrets \
  --namespace=guidebook \
  app=guidebook \
  environment=production

# Restart deployment to pick up new secrets
sudo k3s kubectl rollout restart deployment/guidebook-app -n guidebook
```

**Note:** Secret values must be base64-encoded when using `kubectl patch`. The `echo -n | base64` handles this automatically.

## Troubleshooting

### Pod Not Starting

Check pod events and logs:

```bash
# Describe pod to see events
sudo k3s kubectl describe pod -n guidebook -l app=guidebook

# Check logs for specific container
sudo k3s kubectl logs -n guidebook -l app=guidebook -c frontend
sudo k3s kubectl logs -n guidebook -l app=guidebook -c backend
sudo k3s kubectl logs -n guidebook -l app=guidebook -c mongodb
```

**Common issues:**
- **ImagePullBackOff**: Images not pushed to Docker Hub or wrong tag
- **CrashLoopBackOff**: Application error, check logs
- **Pending**: Resource constraints or volume mount issues

### Volume Permission Issues

If containers can't write to volumes:

```bash
# Check current ownership
ls -la /mnt/pool/guidebook/

# Fix MongoDB permissions
sudo chown -R 999:999 /mnt/pool/guidebook/mongo

# Fix images permissions
sudo chown -R 1001:1001 /mnt/pool/guidebook/images
```

### Ingress Not Working

Check Traefik and cert-manager:

```bash
# Check ingress details
sudo k3s kubectl describe ingress -n guidebook guidebook-ingress

# Check for TLS certificate
sudo k3s kubectl get certificate -n guidebook

# Check Traefik logs
sudo k3s kubectl logs -n kube-system -l app.kubernetes.io/name=traefik
```

### ConfigMap/Secret Not Found

The deployment references:
- ConfigMap: `guidebook-env`
- Secret: `guidebook-secrets`

Verify they exist:

```bash
sudo k3s kubectl get configmap -n guidebook
sudo k3s kubectl get secret -n guidebook
```

If missing, they were likely pruned. Re-run deployment:

```bash
cd /mnt/pool/guidebook/manifests
sudo ./deploy.sh
```

## Configuration Reference

### Environment Variables (env.properties)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_INITDB_DATABASE` | MongoDB database name | `guidebook` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/guidebook` |
| `PORT` | Backend API port | `3000` |
| `FRONTEND_URL` | Frontend application URL | `https://guidebook.orwig.app` |
| `BETTER_AUTH_URL` | Auth service URL (with path) | `https://guidebook.orwig.app/api/auth` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Allowed origins for auth | `https://guidebook.orwig.app` |

### Secrets (Managed on Cluster)

Secrets are created directly on the TrueNAS cluster, not in source control.

| Variable | Description | Generation |
|----------|-------------|------------|
| `BETTER_AUTH_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -base64 32` |
| `ADMIN_USERNAME` | Initial admin username | User-defined |
| `ADMIN_PASSWORD` | Initial admin password | User-defined |

**To view current secret values on the cluster:**
```bash
sudo k3s kubectl get secret guidebook-secrets -n guidebook -o jsonpath='{.data.ADMIN_USERNAME}' | base64 -d
```

### Resource Limits

**Frontend Container:**
- Requests: 100m CPU, 128Mi memory
- Limits: 500m CPU, 256Mi memory

**Backend Container:**
- Requests: 200m CPU, 256Mi memory
- Limits: 1000m CPU, 512Mi memory

**MongoDB Container:**
- Requests: 200m CPU, 256Mi memory
- Limits: 1000m CPU, 512Mi memory

## Logging and Debugging

### View All Logs

```bash
# Follow logs for all containers
sudo k3s kubectl logs -n guidebook -l app=guidebook -f --all-containers=true

# Logs for specific container
sudo k3s kubectl logs -n guidebook -l app=guidebook -c backend -f
```

### Interactive Shell

Access container for debugging:

```bash
# Backend container
sudo k3s kubectl exec -n guidebook -it deployment/guidebook-app -c backend -- sh

# MongoDB container
sudo k3s kubectl exec -n guidebook -it deployment/guidebook-app -c mongodb -- mongosh
```

### Check Resource Usage

```bash
# Pod resource usage
sudo k3s kubectl top pod -n guidebook

# All resources in namespace
sudo k3s kubectl get all -n guidebook
```

## Backup and Restore

### Backup MongoDB Data

```bash
# Create backup
sudo k3s kubectl exec -n guidebook deployment/guidebook-app -c mongodb -- \
  mongodump --archive=/tmp/backup.archive --db=guidebook

# Copy backup out of container
sudo k3s kubectl cp guidebook/guidebook-app-xxxxxxxxxx:/tmp/backup.archive \
  ./mongodb-backup-$(date +%Y%m%d).archive -c mongodb
```

### Backup Character Images

```bash
# On TrueNAS host
sudo tar -czf /mnt/pool/guidebook-images-backup-$(date +%Y%m%d).tar.gz \
  -C /mnt/pool/guidebook/images .
```

### Restore MongoDB Data

```bash
# Copy backup into container
sudo k3s kubectl cp ./mongodb-backup.archive \
  guidebook/guidebook-app-xxxxxxxxxx:/tmp/restore.archive -c mongodb

# Restore from backup
sudo k3s kubectl exec -n guidebook deployment/guidebook-app -c mongodb -- \
  mongorestore --archive=/tmp/restore.archive --db=guidebook --drop
```

### Restore Character Images

```bash
# On TrueNAS host
sudo tar -xzf /mnt/pool/guidebook-images-backup.tar.gz \
  -C /mnt/pool/guidebook/images
```

## Complete Teardown

To completely remove the application:

```bash
# Delete all resources with app=guidebook label
sudo k3s kubectl delete all,ingress,configmap,secret -n guidebook -l app=guidebook

# OR delete entire namespace
sudo k3s kubectl delete namespace guidebook
```

**Note:** This does NOT delete the hostPath volumes. To fully clean up:

```bash
# On TrueNAS host (DESTRUCTIVE - data loss!)
sudo rm -rf /mnt/pool/guidebook/mongo/*
sudo rm -rf /mnt/pool/guidebook/images/*
```

## Architecture Notes

### Multi-Container Pod Design

The deployment uses a single pod with 3 containers:
- **Frontend**: Caddy serving React SPA
- **Backend**: Bun + Hono API server
- **MongoDB**: Database

**Why this design:**
- Containers share network namespace (communicate via `localhost`)
- No network overhead between components
- Atomic deployment (all or nothing)
- Simple scaling model (scale the whole stack together)

**Trade-offs:**
- Cannot scale components independently
- Single point of failure
- `Recreate` deployment strategy required (due to hostPath volumes)

### Storage

**HostPath Volumes:**
- Direct mount from TrueNAS filesystem
- Fast I/O performance
- Survives pod restarts
- Requires `Recreate` strategy (only one pod can mount at a time)

**Ownership:**
- MongoDB runs as uid `999` (mongo user)
- Backend runs as uid `1001` (appuser)
- Directories must have correct ownership

### Security

**Non-root Containers:**
- All containers run as non-root users
- Reduces attack surface
- Requires proper volume permissions

**Secrets Management:**
- Secrets stored in Kubernetes Secret resource
- Gitignored source file (`.env.secret`)
- Never commit secrets to version control

**TLS/HTTPS:**
- Traefik handles TLS termination
- cert-manager provisions certificates automatically
- HTTP→HTTPS redirect enabled

## Quick Reference Commands

```bash
# Deploy new version
bun run docker:push && bun run deploy:prepare
ssh truenas "cd /mnt/pool/guidebook/manifests && sudo ./deploy.sh"

# Check status
sudo k3s kubectl get all -n guidebook

# View logs
sudo k3s kubectl logs -n guidebook -l app=guidebook -f

# Restart deployment
sudo k3s kubectl rollout restart deployment/guidebook-app -n guidebook

# Shell access
sudo k3s kubectl exec -n guidebook -it deployment/guidebook-app -c backend -- sh

# MongoDB access
sudo k3s kubectl exec -n guidebook -it deployment/guidebook-app -c mongodb -- mongosh

# Delete everything
sudo k3s kubectl delete namespace guidebook
```
