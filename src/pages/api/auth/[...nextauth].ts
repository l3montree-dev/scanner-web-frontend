import NextAuth, { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
export const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/sign-in",
  },
  jwt: {
    maxAge: 30 * 60 * 60, // 1 day
  },
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID as string,
      clientSecret: process.env.KEYCLOAK_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    session(params: any) {
      // Send properties to the client, like an access_token and user id from a provider.
      return {
        ...params.session,
        user: { ...params.session.user, id: params.token.sub },
        resource_access: params.token.resource_access,
      };
    },
    jwt(params: any) {
      if (params.profile) {
        params.token.resource_access = params.profile.resource_access;
      }
      if (params.account) {
        params.token.accessToken = params.account.access_token;
      }
      return params.token;
    },
  },
};

export default NextAuth(authOptions);
