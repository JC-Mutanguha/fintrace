import { headers } from "next/headers";

/** App origin for auth email links — uses request host so LAN phone testing works. */
export async function getAppOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}`;
  }
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return "http://localhost:3000";
}

export async function getLoginUrl() {
  return `${await getAppOrigin()}/login`;
}
