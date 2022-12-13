import { NextApiRequest, NextApiResponse } from "next";
import { withSession } from "../../decorators/withSession";
import { getKcAdminClient } from "../../services/keycloak";
import { Session } from "../../types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null
) {
  if (!session) {
    res.statusCode = 401;
    res.end();
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  await getKcAdminClient(session?.accessToken);
  res.end(JSON.stringify({ success: true }));
}

export default withSession(handler);
