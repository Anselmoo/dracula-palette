<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="created-by">
        Created with love by
        <a href="https://github.com/Anselmoo" target="_blank" rel="noopener" class="author-link">
          Anselmoo
        </a>
      </p>
      <div class="footer-links">
        <a
          href="https://github.com/Anselmoo/dracula-palette"
          target="_blank"
          rel="noopener"
          class="footer-link"
        >
          GitHub Repository
        </a>
        <a
          href="https://github.com/dracula/dracula-theme"
          target="_blank"
          rel="noopener"
          class="footer-link"
        >
          Dracula Theme
        </a>
        <a
          href="https://github.com/Anselmoo/dracula-palette/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener"
          class="footer-link"
        >
          Contribute
        </a>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background: var(--dracula-current-line);
  border-top: 1px solid var(--dracula-selection);
  padding: 2rem 0;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.created-by {
  color: var(--footer-text-color);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.author-link {
  color: var(--dracula-pink);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: var(--dracula-purple);
  }
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-link {
  color: var(--footer-link-color);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;

  &:hover {
    color: var(--footer-link-hover-color);
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
