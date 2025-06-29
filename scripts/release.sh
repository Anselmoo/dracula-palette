#!/bin/bash

# Version Release Script for Dracula Palette
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

echo "🎨 Dracula Palette Release Script"
echo "================================="

# Check if we're on main branch (trunk-based development)
CURRENT_BRANCH=$(git branch --show-current)
if [[ "${CURRENT_BRANCH}" != "main" ]]; then
    echo "❌ Error: Must be on main branch to create a release (trunk-based development)"
    echo "   Current branch: ${CURRENT_BRANCH}"
    echo ""
    echo "💡 Switch to main branch first:"
    echo "   git checkout main"
    echo "   git pull origin main"
    echo "   ./scripts/release.sh [patch|minor|major]"
    exit 1
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Working directory is not clean"
    echo "   Please commit or stash your changes first"
    exit 1
fi

# Ensure we're up to date with main (trunk)
echo "📡 Fetching latest changes from main..."
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

echo "🚀 New version: ${NEW_VERSION}"

# Create release branch name following semantic versioning
RELEASE_BRANCH="release/v${NEW_VERSION}"
echo "🌿 Release branch: ${RELEASE_BRANCH}"

# Confirm with user
echo ""
read -p "🤔 Create release ${NEW_VERSION} on branch ${RELEASE_BRANCH}? (y/N): " -n 1 -r
echo ""

if [[ ! ${REPLY} =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
fi

# Create and checkout release branch from main
echo "🌿 Creating release branch ${RELEASE_BRANCH} from main..."
git checkout -b "${RELEASE_BRANCH}"

# Update package.json version
echo "📝 Updating package.json version..."
npm version "$NEW_VERSION" --no-git-tag-version

# Run tests to make sure everything works
echo "🧪 Running tests..."
npm run test:unit
npm run lint
npm run format
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
echo "📤 Pushing release branch and tag..."
git push origin "${RELEASE_BRANCH}"
git push origin "v${NEW_VERSION}"

echo ""
echo "🔀 Next steps for release branch workflow:"
echo "   1. Create a Pull Request from ${RELEASE_BRANCH} to main"
echo "   2. Review and merge the PR"
echo "   3. The tag v${NEW_VERSION} will trigger the release workflow"

echo ""
echo "✅ Release ${NEW_VERSION} created successfully!"
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
echo "   https://github.com/anselmoo/dracula-palette/actions"
echo ""
echo "📦 Once published, you can install with:"
echo "   npm install @anselmoo/dracula-palette@${NEW_VERSION}"
echo ""
echo "🐳 Or pull the Docker image with:"
echo "   docker pull ghcr.io/anselmoo/dracula-palette:${NEW_VERSION}"
