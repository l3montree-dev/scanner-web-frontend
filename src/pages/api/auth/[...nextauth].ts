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
    // @ts-expect-error
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      console.log("session", session, token, user);
      return session;
    },
  },
};
export default NextAuth(authOptions);
