import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "config_session";

export function middleware(req: NextRequest) {
  const session = req.cookies.get(COOKIE_NAME);
  const isAuthenticated = session?.value === "authenticated";
  const isConfigPage = req.nextUrl.pathname.startsWith("/configuracoes");
  const isHome = req.nextUrl.pathname === "/";

  if (isConfigPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isHome && isAuthenticated) {
    return NextResponse.redirect(new URL("/configuracoes", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/configuracoes", "/configuracoes/(.*)"],
};
