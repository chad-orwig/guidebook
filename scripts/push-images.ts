#!/usr/bin/env bun

/**
 * Build and push Docker images to Docker Hub
 * Usage: bun run scripts/push-images.ts [--tag <version>]
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

console.log("🐳 Docker Image Build & Push Script");
console.log("====================================\n");
console.log(`Docker Hub User: ${DOCKER_HUB_USER}`);
console.log(`Git Hash: ${gitHash}`);
console.log(`Tag: ${tag}\n`);

async function buildAndPush() {
  try {
    // Create buildx builder if it doesn't exist
    console.log("\n🔧 Setting up Docker buildx for multi-platform builds...");
    try {
      await $`docker buildx create --name guidebook-builder --use`.quiet();
    } catch {
      // Builder might already exist, try to use it
      await $`docker buildx use guidebook-builder`.quiet();
    }

    for (const image of IMAGES) {
      const remoteImage = `${DOCKER_HUB_USER}/${image.name}:${tag}`;

      console.log(`\n📦 Building ${image.name} for multiple platforms...`);
      console.log(`   Dockerfile: ${image.dockerfile}`);
      console.log(`   Platforms: linux/amd64, linux/arm64`);

      // Build and push multi-platform image directly
      await $`docker buildx build --platform linux/amd64,linux/arm64 -f ${image.dockerfile} -t ${remoteImage} --push .`;

      console.log(`✅ ${image.name} pushed successfully!\n`);
    }

    console.log("\n🎉 All images built and pushed successfully!");
    console.log("\nNext steps:");
    console.log("1. Update Kubernetes manifests if using a custom tag");
    console.log("2. Apply manifests: kubectl apply -f k8s/spike/");
    console.log("3. Verify deployment: kubectl get pods -n guidebook");
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
