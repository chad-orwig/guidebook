#!/usr/bin/env bun

/**
 * Build and push Docker images to Docker Hub (AMD64 only)
 * Usage: bun run scripts/push-images-amd64.ts [--tag <version>]
 */

import { $ } from "bun";

const DOCKER_HUB_USER = "edgethio";
const IMAGES = [
  {
    name: "guidebook-frontend",
    dockerfile: "frontend/Dockerfile",
  },
  {
    name: "guidebook-backend",
    dockerfile: "backend/Dockerfile",
  },
];

// Get git short hash for tagging
async function getGitHash() {
  try {
    const hash = await $`git rev-parse --short HEAD`.text();
    return hash.trim();
  } catch {
    console.error("❌ Could not get git hash. Make sure you're in a git repository.");
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const tagIndex = args.indexOf("--tag");
const customTag = tagIndex !== -1 ? args[tagIndex + 1] : null;
const gitHash = await getGitHash();
const tag = customTag || gitHash;

console.log("🐳 Docker Image Build & Push Script (AMD64 only)");
console.log("================================================\n");
console.log(`Docker Hub User: ${DOCKER_HUB_USER}`);
console.log(`Git Hash: ${gitHash}`);
console.log(`Tag: ${tag}\n`);

async function buildAndPush() {
  try {
    for (const image of IMAGES) {
      const remoteImage = `${DOCKER_HUB_USER}/${image.name}:${tag}`;

      console.log(`\n📦 Building ${image.name} for AMD64...`);
      console.log(`   Dockerfile: ${image.dockerfile}`);
      console.log(`   Platform: linux/amd64`);

      // Build for AMD64 platform
      await $`docker build --platform linux/amd64 -f ${image.dockerfile} -t ${remoteImage} .`;

      console.log(`\n⬆️  Pushing ${remoteImage}...`);
      await $`docker push ${remoteImage}`;

      console.log(`✅ ${image.name} pushed successfully!\n`);
    }

    console.log("\n🎉 All images built and pushed successfully!");
    console.log("\nNext steps:");
    console.log("1. Update Kubernetes manifests if using a custom tag");
    console.log("2. Restart deployment: kubectl rollout restart deployment guidebook-app -n guidebook");
    console.log("3. Verify deployment: kubectl get pods -n guidebook -w");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// Check if user is logged into Docker Hub
async function checkDockerLogin() {
  try {
    console.log("🔐 Checking Docker Hub login...");
    await $`docker info`.quiet();
    console.log("✅ Docker is running\n");
  } catch (error) {
    console.error("❌ Docker is not running or you're not logged in");
    console.error("\nPlease run: docker login");
    process.exit(1);
  }
}

await checkDockerLogin();
await buildAndPush();
