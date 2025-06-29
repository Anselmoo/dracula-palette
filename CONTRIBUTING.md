# Contributing to Dracula Palette

Thank you for your interest in contributing to Dracula Palette! This guide will help you get started with development and contribution.

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- npm, yarn, or pnpm
- Git

### Installation & Development

1. **Fork and clone the repository:**

```bash
git clone https://github.com/YOUR_USERNAME/dracula-palette.git
cd dracula-palette
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open your browser:** [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test:unit` - Run unit tests
- `npm run lint` - Lint and fix code style issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without fixing
- `npm run type-check` - TypeScript type checking
- `npm run optimize:svg:check` - Optimization of SVGs

## 📁 Project Structure

```shell
src/
├── components/          # Vue components
│   ├── ColorExportModal.vue
│   ├── ColorInput.vue
│   ├── ColorSuggestions.vue
│   ├── DraculaPalette.vue
│   └── Footer.vue
│   ├── Header.vue
│   ├── Notification.vue
│   ├── PaletteGenerator.vue
├── data/               # Color data and constants
│   └── draculaColors.ts
├── types/              # TypeScript type definitions
│   ├── color.ts
│   └── palette.ts
├── utils/              # Utility functions
│   ├── colorMatcher.ts
│   ├── exportUtils.ts
│   ├── paletteGenerator.ts
│   └── paletteManager.ts
├── assets/             # Static assets and styles
│   └── styles/
│       ├── main.scss
│       └── variables.scss
├── App.vue             # Root component
└── main.ts             # Application entry point
```

## 🤝 Contributing Guidelines

### Development Workflow

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Set up pre-commit hooks** (recommended):

   ```bash
   pip install pre-commit
   pre-commit install
   ```

   Pre-commit hooks will automatically run:
   - Code formatting (Prettier)
   - Linting (ESLint)
   - Type checking (TypeScript)
   - SVG optimization checks

4. **Make your changes** following our coding standards
5. **Test your changes:**

   ```bash
   npm run test:unit
   npm run lint
   npm run format:check
   npm run type-check
   npm run build
   ```

   Note: If you have pre-commit hooks installed, linting and formatting will run automatically on commit.

6. **Commit your changes** with a descriptive message:

   ```bash
   git commit -m 'feat: add amazing feature'
   ```

7. **Push to your fork:**

   ```bash
   git push origin feature/amazing-feature
   ```

8. **Open a Pull Request** against the `main` branch

### Commit Message Convention

We use conventional commits for clear and consistent commit history:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

```bash
feat: add OKLCH color space support
fix: correct accessibility contrast calculation
docs: update color science documentation
style: improve responsive design for mobile
```

### Code Standards

- **TypeScript**: All new code should be written in TypeScript
- **Vue 3 Composition API**: Use the Composition API for new components
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is enforced via Prettier configuration
- **SCSS**: Use SCSS for styling with our design system variables
- **Accessibility**: Ensure all UI is accessible (WCAG 2.1 AA)

### Testing

- Write unit tests for new utility functions
- Test color conversion algorithms thoroughly
- Ensure accessibility features work correctly
- Test export functionality with various formats

## 🎨 Color Science Contributions

### Adding New Color Standards

When adding support for new color standards:

1. **Create the algorithm** in `src/utils/paletteGenerator.ts`
2. **Add the standard definition** in `src/utils/paletteManager.ts`
3. **Update types** in `src/types/palette.ts`
4. **Add documentation** with proper academic references
5. **Write comprehensive tests** for accuracy

### Color Accuracy

All color algorithms should:

- Use perceptually uniform color spaces when possible
- Include proper academic references
- Be mathematically accurate to published standards
- Handle edge cases (out-of-gamut colors, etc.)

## 🚀 Deployment & CI/CD

### Local Testing

Before submitting a PR, test locally:

```bash
# Test production build
npm run build
npm run preview

# Test Docker build (optional)
docker build -t dracula-palette .
docker run -p 3000:80 dracula-palette
```

### CI/CD Pipeline

Our GitHub Actions workflow automatically:

- **Tests**: Lint, type-check, unit tests, build
- **Deploy**: GitHub Pages (on main branch)
- **Container**: Build and push to GitHub Container Registry
- **Package**: Publish to GitHub Packages

### Environment Variables

For custom deployments:

- `VITE_BASE_URL`: Base URL for the application
- `VITE_GITHUB_PAGES`: Set to 'true' for GitHub Pages

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Exact steps to trigger the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, screen size
- **Screenshots**: If applicable

## 💡 Feature Requests

For new features, please:

- **Check existing issues** to avoid duplicates
- **Describe the use case** and user benefit
- **Provide mockups** or detailed descriptions
- **Consider color science accuracy** for new algorithms

## 📚 Resources

### Color Science

- [OKLCH Color Space](https://oklch.com/)
- [CIE Standards](https://cie.co.at/)
- [Material Design Color](https://m3.material.io/styles/color)
- [HSLuv Documentation](https://www.hsluv.org/)

### Vue.js & TypeScript

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### Design System

- [Dracula Theme Specification](https://draculatheme.com/contribute)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG22/Understanding/)

## 🙋‍♀️ Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community support
- **Dracula Community**: Join the [Dracula Theme community](https://draculatheme.com/)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to Dracula Palette! 🧛‍♂️✨
