import NextAuth from "next-auth";
import { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createAdminClient } from "./supabaseClient";

const allowedEmails = ["sellershcrisp@gmail.com", "amherring11@gmail.com"];

const userDisplayNames: Record<string, string> = {
  "sellershcrisp@gmail.com": "Sellers",
  "amherring11@gmail.com": "Abby"
};

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.PROD_AUTH_GOOGLE_ID!,
      clientSecret: process.env.PROD_AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email || !allowedEmails.includes(user.email)) {
        return "/error";
      }

      try {
        const supabaseAdmin = createAdminClient();

        // First try to find existing user by email
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (existingUser) {
          // Update existing user
          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              name: userDisplayNames[user.email],
              avatar_url: user.image,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingUser.id);

          if (updateError) {
            console.error("Error updating user:", updateError);
            return "/error";
          }
          
          // Store the existing ID in the token
          user.id = existingUser.id;
        } else {
          // Create new user with a UUID
          const { data: newUser, error: createError } = await supabaseAdmin
            .from("users")
            .insert({
              email: user.email,
              name: userDisplayNames[user.email],
              avatar_url: user.image
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating user:", createError);
            return "/error";
          }

          // Store the new ID in the token
          user.id = newUser.id;
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return "/error";
      }
    },
    async session({ session, token }) {
      if (!session.user?.email) return session;
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!, // Use the stored ID
          displayName: userDisplayNames[session.user.email]
        },
      };
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id; // Store the database ID
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
