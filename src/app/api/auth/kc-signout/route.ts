import { NextResponse } from "next/server";
import { decorate } from "../../../../decorators/decorate";
import { withToken } from "../../../../decorators/withToken";

export const GET = decorate(async (req, [token]) => {
  console.log("CALLED");
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  let path = `${
    process.env.KEYCLOAK_ISSUER
  }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
    process.env.NEXTAUTH_URL as string
  )}`;

  if (token?.idToken) {
    path = `${path}&id_token_hint=${token.idToken}`;
  } else {
    path = `${path}&client_id=${process.env.KEYCLOAK_ID}`;
  }

  return { path };
}, withToken);
