import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token != null,
  },
  pages: {
    signIn: '/auth/login',
  },
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/login (login page)
     * - auth/register (register page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/register).*)",
  ],
}