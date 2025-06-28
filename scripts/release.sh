#!/bin/bash

# Version Release Script for Dracula Palette
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

echo "🎨 Dracula Palette Release Script"
echo "================================="

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "${CURRENT_BRANCH}" != "main" ]]; then
    echo "❌ Error: Must be on main branch to create a release"
    echo "   Current branch: ${CURRENT_BRANCH}"
    exit 1
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Working directory is not clean"
    echo "   Please commit or stash your changes first"
    exit 1
fi

# Ensure we're up to date
echo "📡 Fetching latest changes..."
git fetch origin main
git pull origin main

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: ${CURRENT_VERSION}" # cspell:ignore versio

# Calculate new version
case ${BUMP_TYPE} in
    patch)
        NEW_VERSION=$(node -e "
            const semver = require('semver');
            console.log(semver.inc('${CURRENT_VERSION}', 'patch'));
        " 2>/dev/null || echo "Error: semver package not found. Install with: npm install -g semver")
        ;;
    minor)
        NEW_VERSION=$(node -e "
            const semver = require('semver');
            console.log(semver.inc('${CURRENT_VERSION}', 'minor'));
        " 2>/dev/null || echo "Error: semver package not found. Install with: npm install -g semver")
        ;;
    major)
        NEW_VERSION=$(node -e "
            const semver = require('semver');
            console.log(semver.inc('${CURRENT_VERSION}', 'major'));
        " 2>/dev/null || echo "Error: semver package not found. Install with: npm install -g semver")
        ;;
    *)
        echo "❌ Error: Invalid bump type. Use: patch, minor, or major"
        exit 1
        ;;
esac

# Fallback version calculation if semver is not available
if [[ ${NEW_VERSION} == "Error:"* ]]; then
    echo "⚠️  Warning: semver package not found, using manual calculation"
    IFS='.' read -ra VERSION_PARTS <<< "${CURRENT_VERSION}"
    MAJOR=${VERSION_PARTS[0]}
    MINOR=${VERSION_PARTS[1]}
    PATCH=${VERSION_PARTS[2]}

    case ${BUMP_TYPE} in
        patch)
            NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"
            ;;
        minor)
            NEW_VERSION="${MAJOR}.$((MINOR + 1)).0"
            ;;
        major)
            NEW_VERSION="$((MAJOR + 1)).0.0"
            ;;
    esac
fi

echo "🚀 New version: ${NEW_VERSION}" # cspell:ignore versio

# Confirm with user
echo ""
read -p "🤔 Create release ${NEW_VERSION}? (y/N): " -n 1 -r # cspell:ignore relea
echo ""

if [[ ! ${REPLY} =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
fi

# Update package.json version
echo "📝 Updating package.json version..."
npm version "$NEW_VERSION" --no-git-tag-version

# Run tests to make sure everything works
echo "🧪 Running tests..."
npm run test:unit
npm run lint
npm run type-check

# Build the project
echo "🔨 Building project..."
npm run build

# Commit version bump
echo "💾 Committing version bump..."
git add package.json package-lock.json
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create and push tag
echo "🏷️  Creating tag v${NEW_VERSION}..."
git tag "v${NEW_VERSION}"

# Push changes and tag
echo "📤 Pushing changes and tag..."
git push origin main
git push origin "v${NEW_VERSION}"

echo ""
echo "✅ Release ${NEW_VERSION} created successfully!" # cspell:ignore Releas VERSI
echo ""
echo "🎯 What happens next:"
echo "   • GitHub Actions will automatically:"
echo "     - Run tests and build the project"
echo "     - Create a GitHub release"
echo "     - Publish to npm packages"
echo "     - Build and push Docker image"
echo "     - Deploy to GitHub Pages"
echo ""
echo "🔗 Check the progress at:"
echo "   https://github.com/\${{ github.repository }}/actions"
echo ""
echo "📦 Once published, you can install with:"
echo "   npm install @\${{ github.repository_owner }}/dracula-palette@${NEW_VERSION}"
echo ""
echo "🐳 Or pull the Docker image with:"
echo "   docker pull ghcr.io/\${{ github.repository }}:${NEW_VERSION}"
