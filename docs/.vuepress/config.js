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
          text: 'Setup',
          // collapsible: true,
          children: ['/setup/', '/setup/development', '/setup/database', '/setup/environment'],
        },
        // {
        //   text: 'Usage',
        //   // collapsible: true,
        //   children: [
        //     '/usage/',
        //     '/usage/dependency-injection',
        //     '/usage/database',
        //     '/usage/environment',
        //   ],
        // },
        {
          text: 'API',
          // collapsible: true,
          children: ['/api/', '/api/authentication', '/api/error-handling', '/api/response-format'],
        },
        {
          text: 'Contributing',
          // collapsible: true,
          children: [
            '/contributing/',
            // '/contributing/workflow',
            '/contributing/documentation',
            // '/contributing/code-style',
            // '/contributing/testing',
          ],
        },
        {
          text: 'FAQ',
          collapsible: true,
          children: ['/faq/common-issues'],
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
