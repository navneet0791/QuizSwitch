import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const pathname = url.pathname;

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
        return;
    }

    const pick = Math.random() < 0.5 ? "a" : "b";
    const cookieValue = `${cookieName}=${pick}; Path=/; Max-Age=2592000; SameSite=Lax`;

    if (pick === "b") {
        url.pathname = "/v2";
        const res = NextResponse.redirect(url);
        res.headers.set("Set-Cookie", cookieValue);
        return res;
    } else {
        const res = NextResponse.next();
        res.headers.set("Set-Cookie", cookieValue);
        return res;
    }
}

export const config = {
    matcher: "/",
};
