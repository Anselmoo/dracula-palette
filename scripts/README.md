# Scripts

This directory contains utility scripts for development and release management.

## Release Script

### `release.sh`

Automates the process of creating a new release using **trunk-based development** with automatic release branch creation and proper semantic versioning.

**Usage:**

```bash
# Patch release (1.0.0 -> 1.0.1)
./scripts/release.sh patch

# Minor release (1.0.0 -> 1.1.0)
./scripts/release.sh minor

# Major release (1.0.0 -> 2.0.0)
./scripts/release.sh major

# Default is patch if no argument provided
./scripts/release.sh
```

**Trunk-Based Development Workflow:**

1. ✅ Validates you're on the `main` branch (trunk)
2. ✅ Ensures working directory is clean
3. ✅ Pulls latest changes from `main` (trunk)
4. ✅ Calculates new version based on semver
5. ✅ **Creates release branch**: `release/v{major}.{minor}.{patch}`
6. ✅ Updates `package.json` version
7. ✅ Runs tests and linting
8. ✅ Builds the project
9. ✅ Commits version bump to release branch
10. ✅ Creates and pushes Git tag
11. ✅ Pushes release branch for PR creation
12. ✅ Provides next steps for merge workflow

**Prerequisites:**

- Git repository with `main` branch
- Clean working directory
- All changes committed and pushed to `main`
- Optional: `semver` npm package for better version calculation
  ```bash
  npm install -g semver
  ```

**Release Branch Workflow:**

The script follows trunk-based development best practices:

1. **Start from main**: Always create releases from the stable `main` branch
2. **Automatic branch creation**: Creates `release/v{version}` branches automatically
3. **Short-lived branches**: Release branches are temporary for final testing
4. **PR-based merging**: Release branches merge back to main via Pull Request
5. **Tag-triggered deployment**: Git tags trigger automated CI/CD workflows

**After running:**

1. **Review the release branch**: `release/v{version}` is created and pushed
2. **Create Pull Request**: From `release/v{version}` → `main`
3. **Final review**: Team reviews the release changes
4. **Merge to main**: Approving the PR merges changes back to trunk
5. **Automated deployment**: The Git tag triggers GitHub Actions workflows:
   - 🧪 Run tests and quality checks
   - 📦 Publish to GitHub Packages (npm)
   - 🐳 Build and push Docker image to GHCR
   - 🌐 Deploy to GitHub Pages
   - 📋 Create GitHub Release with artifacts

**Example Release Flow:**

```bash
# On main branch
git checkout main
git pull origin main

# Create release (e.g., 1.2.3 → 1.2.4)
./scripts/release.sh patch

# Script creates: release/v1.2.4 branch
# Creates: v1.2.4 tag
# Pushes both to origin

# Next: Create PR from release/v1.2.4 → main
# After merge: GitHub Actions deploys v1.2.4
```

## Manual Release Process

If you prefer to create releases manually:

1. **Update version in package.json:**

   ```bash
   npm version patch  # or minor, major
   ```

2. **Create and push tag:**

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

3. **The release workflow will trigger automatically**

## Version Strategy

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Incompatible API changes
- **MINOR** version: Backwards-compatible functionality additions
- **PATCH** version: Backwards-compatible bug fixes

### Release Channels

1. **Development Builds (main branch):**
   - Dev versions: `0.0.0-dev.abc123f`
   - Tags: `dev`, `latest` (overwritten each push)
   - Triggered on every push to `main`
   - **Benefits**: No registry pollution, always latest dev build

2. **Semantic Releases (tags):**
   - Semantic versions: `1.2.3`
   - Tags: `v1.2.3`, `1.2`, `1`, `latest`
   - Triggered on Git tags matching `v*.*.*`

### Artifacts

Each release produces:

- **npm package**: `@{owner}/dracula-palette@{version}`
- **Docker image**: `ghcr.io/{repo}:{version}`
- **GitHub Pages**: `https://{owner}.github.io/dracula-palette/`
- **GitHub Release**: With source code and build artifacts

### Usage Examples

```bash
# Install latest stable release
npm install @anselmoo/dracula-palette@latest

# Install latest development build (from main branch)
npm install @anselmoo/dracula-palette@dev

# Pull stable Docker image
docker pull ghcr.io/anselmoo/dracula-palette:latest

# Pull development Docker image
docker pull ghcr.io/anselmoo/dracula-palette:dev
```

**Development builds** are perfect for:

- Testing latest features before release
- Integration testing in CI/CD pipelines
- Early feedback and bug reports

**Stable releases** are recommended for:

- Production deployments
- Documentation and tutorials
- Long-term projects
