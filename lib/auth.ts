import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Here you would typically check the database for the user
        // For now, we'll create a mock user for demonstration
        const user = {
          id: "1",
          name: "Demo User",
          email: credentials.email,
          // In a real app, you would hash and compare passwords
        };

        // In a real application, you would verify the password here
        // For demo purposes, we'll accept any password
        if (user) {
          return user;
        }

        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, user, token }: { session: any; user: any; token: any }) {
      if (session.user) {
        session.user.id = token.id || user?.id;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};