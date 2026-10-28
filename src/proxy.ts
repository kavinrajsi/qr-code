import { NextResponse, type NextRequest } from "next/server";

// Fast path only: send visitors without a session cookie to /login with a proper 307.
// Real authorization happens in requireUser() and the policy checks on each page and action.
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // "/" and the public pages are intentionally not listed, so visitors can read them without signing in.
  matcher: ["/dashboard/:path*", "/stores/:path*", "/codes/:path*", "/admin/:path*"],
};
