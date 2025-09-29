import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import connectDB from "@/lib/dbConnect";
import User, { IUser } from "@/lib/model/User";

type LeanUser = IUser & { _id: string };

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = (await User.findOne({ email: credentials.email }).lean()) as LeanUser | null;
        if (!user) throw new Error("User not found");

        const isValid = await compare(credentials.password, user.password || "");
        if (!isValid) throw new Error("Invalid password");

        // ✅ return id so token.sub is set
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Add callbacks here
  callbacks: {
    async jwt({ token, user }) {
      // First time login → persist user id into token
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      } else if (token?.sub) {
        // fallback to default sub if id missing
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
