import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['es-ES', 'es-CO', 'en-US'],
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: 'es-ES',
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/', '/(es-ES|es-CO|en-US)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};