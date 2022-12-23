import NextAuth, { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { findUserById } from "../../../services/userService";
import { INetwork, IToken } from "../../../types";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: IToken) {
  try {
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_ID as string,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
          client_secret: process.env.KEYCLOAK_SECRET as string,
        }),
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

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
    async session(params: any) {
      // Send properties to the client, like an access_token and user id from a provider.
      // check if we can fetch the current user.
      let networks: INetwork[] = [];
      if (params.token.sub) {
        // fetch the user#
        const user = await findUserById(params.token.sub);
        networks = user?.networks || [];
      }
      return {
        ...params.session,
        user: { ...params.session.user, id: params.token.sub, networks },
        resource_access: params.token.resource_access,
        error: params.token.error,
      };
    },
    jwt(params: any) {
      if (params.profile) {
        params.token.resource_access = params.profile.resource_access;
      }
      if (params.account) {
        params.token.accessToken = params.account.access_token;
        params.token.expiresAt = params.account.expires_at * 1000;
        params.token.refreshToken = params.account.refresh_token;

        return params.token;
      }

      if (Date.now() < params.token.expiresAt) {
        return params.token;
      }
      return refreshAccessToken(params.token);
    },
  },
};

export default NextAuth(authOptions);
