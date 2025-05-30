import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env/server.mjs";
import { prisma } from "./db";

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export function getAuthOptions(isVercelHostname: boolean) {
  const authOptions: NextAuthOptions = {
    callbacks: {
      session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
          // session.user.role = user.role; <-- put other properties on the session here
        }
        return session;
      },
    },
    adapter: PrismaAdapter(prisma),
    providers: [
      GithubProvider({
        clientId: isVercelHostname
          ? env.GITHUB_VERCEL_CLIENT_ID
          : env.GITHUB_CLIENT_ID,
        clientSecret: isVercelHostname
          ? env.GITHUB_VERCEL_CLIENT_SECRET
          : env.GITHUB_CLIENT_SECRET,
      }),
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      /**
       * ...add more providers here
       *
       * Most other providers require a bit more work than the Discord provider.
       * For example, the GitHub provider requires you to add the
       * `refresh_token_expires_in` field to the Account model. Refer to the
       * NextAuth.js docs for the provider you want to use. Example:
       * @see https://next-auth.js.org/providers/github
       **/
    ],
  };
  return authOptions;
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const host = ctx.req.headers.host;
  if (!host) {
    throw new Error("'ctx.req.headers.host' is undefined");
  }

  const isVercelHostname = host?.includes(".vercel.app");
  return getServerSession(ctx.req, ctx.res, getAuthOptions(isVercelHostname));
};
