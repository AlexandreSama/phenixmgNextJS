// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    // Skip pour NextAuth lui-même
    if (req.nextUrl.pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Lis le token NextAuth depuis les cookies
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isProtected =
        req.nextUrl.pathname === "/dashboard" ||
        req.nextUrl.pathname.startsWith("/dashboard/");

    if (isProtected && !token) {
        const url = req.nextUrl.clone();
        url.pathname = "/signed-out"; // page animée
        url.search = "";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/dashboard/:path*"],
};
