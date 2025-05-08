import NextAuth from "next-auth";
import { getAuthOptions } from "../../../server/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host;
  if (!host) {
    throw new Error("'ctx.req.headers.host' is undefined");
  }

  const isVercelHostname = host?.includes(".vercel.app");
  return await NextAuth(req, res, getAuthOptions(isVercelHostname));
}
