import { NextRequest, NextResponse } from "next/server";

// Simple A/B middleware:
// - If user already has `ab_variant` cookie, route them consistently.
// - Otherwise pick 'a' or 'b' at random, set cookie for 30 days and route:
//    - 'a' -> keep at '/'
//    - 'b' -> redirect to '/v2'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Only run on the root page to decide variant.
  if (pathname !== "/") {
    return;
  }

  const cookieName = "ab_variant";
  const existing = req.cookies.get(cookieName)?.value;
  if (existing) {
    if (existing === "b") {
      url.pathname = "/v2";
      return NextResponse.redirect(url);
    }
    // variant 'a' -> allow to continue to '/'
    return;
  }

  // No cookie -> pick a variant
  const pick = Math.random() < 0.5 ? "a" : "b";
  // Set cookie for 30 days (2592000 seconds)
  const cookieValue = `${cookieName}=${pick}; Path=/; Max-Age=2592000; SameSite=Lax`;

  if (pick === "b") {
    url.pathname = "/v2";
    const res = NextResponse.redirect(url);
    res.headers.set("Set-Cookie", cookieValue);
    return res;
  } else {
    // stay on '/'
    const res = NextResponse.next();
    res.headers.set("Set-Cookie", cookieValue);
    return res;
  }
}

// Only match the root path so middleware is lightweight.
export const config = {
  matcher: "/",
};
