const withNextIntl = require('next-intl/plugin')('./app/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

module.exports = withNextIntl(nextConfig);