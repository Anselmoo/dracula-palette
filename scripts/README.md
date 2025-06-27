# Scripts

This directory contains utility scripts for development and release management.

## Release Script

### `release.sh`

Automates the process of creating a new release with proper semantic versioning.

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

**What it does:**

1. ✅ Validates you're on the `main` branch
2. ✅ Ensures working directory is clean
3. ✅ Pulls latest changes from origin
4. ✅ Calculates new version based on semver
5. ✅ Updates `package.json` version
6. ✅ Runs tests and linting
7. ✅ Builds the project
8. ✅ Commits version bump
9. ✅ Creates and pushes Git tag
10. ✅ Triggers automated GitHub Actions workflows

**Prerequisites:**

- Git repository with `main` branch
- Clean working directory
- All changes committed
- Optional: `semver` npm package for better version calculation
  ```bash
  npm install -g semver
  ```

**After running:**
The GitHub Actions workflows will automatically:

- 🧪 Run tests and quality checks
- 📦 Publish to GitHub Packages (npm)
- 🐳 Build and push Docker image to GHCR
- 🌐 Deploy to GitHub Pages
- 📋 Create GitHub Release with artifacts

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
