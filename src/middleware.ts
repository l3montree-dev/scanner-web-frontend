import { NextRequest } from "next/server";

import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import HttpError from "./errors/HttpError";

export default function middleware(request: NextRequest) {
  try {
    if (
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/administration")
    ) {
      return withAuth(request as NextRequestWithAuth);
    }
  } catch (e) {
    if (e instanceof HttpError) {
      return e.toNextResponse();
    }
    throw e;
  }
}
