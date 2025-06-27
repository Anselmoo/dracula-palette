# Deployment Guide

This application can be deployed in multiple ways:

## GitHub Pages (Recommended for this project)

✅ **This app CAN run on GitHub Pages** because it's a static Vue.js application with no server-side requirements.

The GitHub Actions workflow automatically deploys to GitHub Pages on every push to `main`. To enable:

1. Go to your repository Settings
2. Navigate to Pages section
3. Select "GitHub Actions" as the source
4. The workflow will handle the rest

**URL:** `https://<your-account>.github.io/dracula-palette/`

## Netlify

✅ **Also works perfectly on Netlify** with even easier setup:

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Netlify will auto-deploy on every push

Benefits over GitHub Pages:

- Custom domains without paid plans
- Better preview deployments
- Advanced redirect rules
- Form handling (if needed)

## Container Registry (Docker)

The GitHub Actions also builds and pushes to GitHub Container Registry:

```bash
# Pull and run the container
docker pull ghcr.io/anselmoo/dracula-palette:latest
docker run -p 8080:80 ghcr.io/anselmoo/dracula-palette:latest
```

Or use docker-compose:

```bash
# Production
docker-compose up app

# Development
docker-compose --profile dev up dev
```

## Local Development

```bash
# Standard development
npm install
npm run dev

# Docker development
docker-compose --profile dev up
```

## Build Commands

```bash
# Test
npm run lint
npm run type-check
npm run test:unit

# Build
npm run build
npm run preview
```
