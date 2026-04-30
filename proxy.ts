import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("pghlasdetg")?.value;
  const url = req.nextUrl.clone();


  if (url.pathname === "/" && token) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
    matcher: ["/", "/dashboard/:path*"], 
  };
  