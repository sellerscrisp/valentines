import NextAuth from "next-auth";
import { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails = ["sellershcrisp@gmail.com", "amherring11@gmail.com"];

const userDisplayNames: Record<string, string> = {
  "sellershcrisp@gmail.com": "Sellers",
  "amherring11@gmail.com": "Abby"
};

export const config = {
  providers: [
    GoogleProvider({
      clientId: process.env.PROD_AUTH_GOOGLE_ID!,
      clientSecret: process.env.PROD_AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email || !allowedEmails.includes(user.email)) {
          return "/error";
        }
        return true;
      }
      return false;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          provider: token.provider,
          id: token.sub,
          displayName: session.user?.email ? userDisplayNames[session.user.email] : null
        },
      };
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
