import "server-only";

import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { isTrustedAccountActionOrigin } from "@/app/lib/customer-auth-linking-pure";

export type CustomerSessionAuthContext = {
  customerId: string;
  authMethod: "google" | "credentials";
  email: string | null;
};

export async function getCustomerSessionAuthContext(request: globalThis.Request): Promise<CustomerSessionAuthContext | null> {
  const session = await auth();
  const token = await getToken({ req: request });
  const customerId = session?.user?.id;
  if (!customerId || !token || token.customerId !== customerId) return null;
  if (token.authMethod !== "google" && token.authMethod !== "credentials") return null;
  return {
    customerId,
    authMethod: token.authMethod,
    email: typeof token.email === "string" ? token.email : null,
  };
}

export async function getCurrentCustomerSessionAuthContext(): Promise<CustomerSessionAuthContext | null> {
  const session = await auth();
  const requestHeaders = await headers();
  const token = await getToken({ req: { headers: requestHeaders } });
  const customerId = session?.user?.id;
  if (!customerId || !token || token.customerId !== customerId) return null;
  if (token.authMethod !== "google" && token.authMethod !== "credentials") return null;
  return {
    customerId,
    authMethod: token.authMethod,
    email: typeof token.email === "string" ? token.email : null,
  };
}

export function isTrustedAccountActionRequest(request: globalThis.Request): boolean {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  return isTrustedAccountActionOrigin({
    origin: request.headers.get("origin"),
    authUrl: process.env.AUTH_URL,
    vercelUrl: process.env.VERCEL_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}
