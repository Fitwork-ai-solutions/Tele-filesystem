import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/drive") ||
    pathname.startsWith("/api/files") ||
    pathname.startsWith("/api/folders") ||
    pathname.startsWith("/api/user")
  ) {
    const token = request.cookies.get("tgdrive_token")?.value;

    if (!token || !(await verifyToken(token))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/drive", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/drive/:path*",
    "/api/files/:path*",
    "/api/folders/:path*",
    "/api/user/:path*",
  ],
};
