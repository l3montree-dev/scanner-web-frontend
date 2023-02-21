import { NextRequest } from "next/server";

import { NextRequestWithAuth, withAuth } from "next-auth/middleware";

export default function middleware(request: NextRequest) {
  console.log("middleware", request.nextUrl.pathname);
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/administration")
  ) {
    return withAuth(request as NextRequestWithAuth);
  }
}
