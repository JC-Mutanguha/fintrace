import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

/** Server InsForge client (Server Components, Route Handlers, Actions). */
export async function createInsForgeServerClient() {
  return createServerClient({
    cookies: await cookies(),
  });
}
