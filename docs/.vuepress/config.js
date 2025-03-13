import { viteBundler } from '@vuepress/bundler-vite';
import { defaultTheme } from '@vuepress/theme-default';
import { defineUserConfig } from 'vuepress';
import { searchPlugin } from '@vuepress/plugin-search';

export default defineUserConfig({
  // Site metadata
  title: 'Entix API Documentation',
  description: 'Documentation for the Entix API - A modern Express.js API with TypeScript',

  // Base URL - important for GitHub Pages deployment
  // If using custom domain (api-docs.entix.org), use '/'
  // If using GitHub Pages without custom domain, use '/entix-api/'
  base: '/',

  // Bundler configuration
  bundler: viteBundler(),

  // Theme configuration
  theme: defaultTheme({
    // logo: '/images/logo.png',
    repo: 'chen7david/entix-api',
    docsDir: 'docs',
    editLink: true,

    // Sidebar configuration
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          link: '/',
        },
        {
          text: 'Getting Started',
          collapsible: true,
          children: [
            '/getting-started/installation',
            '/getting-started/dev-container',
            '/getting-started/manual-setup',
            '/getting-started/database',
            '/getting-started/development',
            '/getting-started/environment',
          ],
        },
        {
          text: 'Core Concepts',
          collapsible: true,
          children: [
            '/core-concepts/project-structure',
            '/core-concepts/dependency-injection',
            '/core-concepts/routing-controllers',
            '/core-concepts/environment-config',
            '/core-concepts/database',
          ],
        },
        {
          text: 'Features',
          collapsible: true,
          children: [
            '/features/validation',
            '/features/logging',
            '/features/error-handling',
            '/features/authentication',
          ],
        },
        {
          text: 'API Reference',
          collapsible: true,
          children: [
            '/api-reference/endpoints',
            '/api-reference/response-format',
            '/api-reference/error-codes',
          ],
        },
        {
          text: 'Development Guide',
          collapsible: true,
          children: [
            '/development/coding-standards',
            '/development/testing',
            '/development/documentation',
            '/development/contributing',
          ],
        },
        {
          text: 'Deployment',
          collapsible: true,
          children: ['/deployment/production-setup', '/deployment/docker', '/deployment/ci-cd'],
        },
        {
          text: 'Troubleshooting',
          collapsible: true,
          children: ['/troubleshooting/common-issues', '/troubleshooting/debugging'],
        },
        {
          text: 'AI Development',
          collapsible: true,
          children: ['/ai-development/guide'],
        },
      ],
    },
  }),

  // Plugins
  plugins: [
    searchPlugin({
      // Search options
      locales: {
        '/': {
          placeholder: 'Search',
        },
      },
      // These options help fix the search bar display issue
      isSearchable: page => page.path !== '/',
      getExtraFields: page => page.frontmatter.tags || [],
      maxSuggestions: 10,
    }),
  ],
});
