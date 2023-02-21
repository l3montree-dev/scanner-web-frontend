import { decorate } from "../../../decorators/decorate";
import { withToken } from "../../../decorators/withToken";

const handler = decorate(async (req, res, [token]) => {
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
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

  res.json({ path });
}, withToken);

export default handler;
