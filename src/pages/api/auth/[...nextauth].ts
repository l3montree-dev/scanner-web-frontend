import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
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
    async session(params: any) {
      // Send properties to the client, like an access_token and user id from a provider.
      return { ...params.session, roles: params.token.roles };
    },
    jwt(params: any) {
      if (params.profile) {
        params.token.roles = params.profile.roles;
      }
      return params.token;
    },
  },
};

export default NextAuth(authOptions);
