#!/usr/bin/env bun

import { $ } from "bun";
import * as fs from "fs";
import * as path from "path";

const MANIFESTS_DIR = "/Volumes/guidebook/manifests";
const MANIFESTS_FILE = path.join(MANIFESTS_DIR, "manifests.yaml");
const DEPLOY_SCRIPT = path.join(MANIFESTS_DIR, "deploy.sh");

async function main() {
  console.log("🚀 Preparing deployment manifests...\n");

  // Step 1: Generate manifests using kustomize
  console.log("📦 Generating manifests from Kustomize...");
  try {
    const result = await $`kustomize build k8s/overlays/production`.text();
    console.log("✅ Manifests generated successfully\n");

    // Step 2: Check if SMB share is mounted
    console.log("🔍 Checking SMB share...");
    if (!fs.existsSync(MANIFESTS_DIR)) {
      console.error(`❌ Error: ${MANIFESTS_DIR} does not exist`);
      console.error("   Please ensure the SMB share is mounted at /Volumes/guidebook");
      process.exit(1);
    }
    console.log("✅ SMB share is mounted\n");

    // Step 3: Clear out the manifests directory
    console.log("🧹 Cleaning manifests directory...");
    const files = fs.readdirSync(MANIFESTS_DIR);
    for (const file of files) {
      const filePath = path.join(MANIFESTS_DIR, file);
      fs.rmSync(filePath, { recursive: true, force: true });
    }
    console.log("✅ Directory cleaned\n");

    // Step 4: Write manifests to file
    console.log("📝 Writing manifests.yaml...");
    fs.writeFileSync(MANIFESTS_FILE, result);
    console.log(`✅ Manifests written to ${MANIFESTS_FILE}\n`);

    // Step 5: Generate TrueNAS deployment script
    console.log("📝 Generating deploy.sh script...");
    const deployScript = `#!/bin/bash
set -e

echo "🚀 Deploying Guidebook to k3s..."
echo ""

sudo k3s kubectl apply -f manifests.yaml \\
  --prune \\
  -l app=guidebook \\
  --prune-allowlist=core/v1/Namespace \\
  --prune-allowlist=core/v1/ConfigMap \\
  --prune-allowlist=core/v1/Secret \\
  --prune-allowlist=core/v1/Service \\
  --prune-allowlist=apps/v1/Deployment \\
  --prune-allowlist=networking.k8s.io/v1/Ingress

echo ""
echo "📊 Checking deployment status..."
echo ""
sudo k3s kubectl get pods -n guidebook

echo ""
echo "✅ Deployment complete!"
echo ""
echo "To view logs:"
echo "  sudo k3s kubectl logs -n guidebook -l app=guidebook -f"
echo ""
echo "To check status:"
echo "  sudo k3s kubectl get all -n guidebook"
`;

    fs.writeFileSync(DEPLOY_SCRIPT, deployScript);
    console.log(`✅ Deploy script written to ${DEPLOY_SCRIPT}\n`);

    // Step 6: Make deploy.sh executable
    console.log("🔧 Making deploy.sh executable...");
    fs.chmodSync(DEPLOY_SCRIPT, 0o755);
    console.log("✅ Deploy script is now executable\n");

    // Step 7: Print success message
    console.log("🎉 Deployment preparation complete!\n");
    console.log("📋 Next steps:");
    console.log("   1. SSH into TrueNAS:");
    console.log("      ssh truenas");
    console.log("");
    console.log("   2. Navigate to the manifests directory:");
    console.log("      cd /mnt/pool/guidebook/manifests");
    console.log("");
    console.log("   3. Run the deployment script:");
    console.log("      ./deploy.sh");
    console.log("");
  } catch (error) {
    console.error("❌ Error generating manifests:", error);
    process.exit(1);
  }
}

main();
