import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { Session } from "../../../types";
export const authOptions = {
  pages: {
    signIn: "/auth/sign-in",
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
        roles: params.token.roles,
        accessToken: params.token.accessToken,
      };
    },
    jwt(params: any) {
      if (params.profile) {
        params.token.roles = params.profile.roles;
      }
      if (params.account) {
        params.token.accessToken = params.account.access_token;
      }
      return params.token;
    },
  },
};

export default NextAuth(authOptions);
