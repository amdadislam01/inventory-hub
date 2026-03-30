import NextAuth from "next-auth";
import type { Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "./db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
           return null;
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email }).lean();

        if (!user || !user.password) {
           return null;
        }

        const isValid = await bcrypt.compare(
           credentials.password as string, 
           user.password as string
        );

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: NextAuthUser | null }) {
      if (user) {
        token.id = user.id;
        token.role = (user as NextAuthUser & { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        (session.user as Session["user"] & { id?: string }).id = token.id as string;
        (session.user as Session["user"] & { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" }
});
