const getBaseUrl = (issuer: string) => {
  const url = new URL(issuer);
  // build the base url from the issuer
  return `${url.protocol}//${url.hostname}:${url.port}`;
};

const getRealmName = (issuer: string) => {
  return issuer.substring(issuer.lastIndexOf("/") + 1);
};

export const getKcAdminClient = async (accessToken: string) => {
  const KcAdminClient = (await import("@keycloak/keycloak-admin-client"))
    .default;

  console.log(KcAdminClient);
  if (!process.env.KEYCLOAK_ISSUER) {
    throw new Error("KEYCLOAK_ISSUER is not defined");
  }
  const kcAdminClient = new KcAdminClient({
    // the issuer contains the realm as well.
    baseUrl: getBaseUrl(process.env.KEYCLOAK_ISSUER),
    realmName: getRealmName(process.env.KEYCLOAK_ISSUER),
  });
  // set the access token
  kcAdminClient.setAccessToken(accessToken);
  return kcAdminClient;
};
