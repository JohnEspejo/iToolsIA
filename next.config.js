const withNextIntl = require('next-intl/plugin')('./app/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Exclude the RAG_Python directory from the build
  exclude: ['RAG_Python-20251020T182028Z-1-001']
};

module.exports = withNextIntl(nextConfig);