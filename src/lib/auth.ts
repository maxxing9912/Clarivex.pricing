// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Estendi il tipo Session per aggiungere 'id' a user
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
};