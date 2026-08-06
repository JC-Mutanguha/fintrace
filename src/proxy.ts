import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

function hasSession(request: NextRequest) {
  return (
    request.cookies.has("insforge_access_token") ||
    request.cookies.has("insforge_refresh_token")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/login");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAuthApi = pathname.startsWith("/api/auth");
  const isPublicAsset =
    pathname === "/manifest.json" || pathname.startsWith("/icon");
  const authed = hasSession(request);

  if (isPublicAsset) {
    return NextResponse.next();
  }

  if (!authed && !isLogin && !isAuthApi) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next({ request });

  await updateSession({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
