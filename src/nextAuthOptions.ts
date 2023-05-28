import { AuthOptions } from "next-auth";
import { prisma } from "./db/connection";
import { IToken } from "./types";
import CredentialsProvider from "next-auth/providers/credentials";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: IToken) {
  return {
    ...token,
    error: "RefreshAccessTokenError",
  };
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
    if (!response.ok) {
      throw response;
    }

    const refreshedTokens = await response.json();

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
    CredentialsProvider({
      credentials: {},
      authorize: async (credentials: any) => {
        const shareLinkSecret = credentials?.shareLinkSecret;

        if (!shareLinkSecret) {
          return null;
        }
        // fetch the share link
        const link = await prisma.shareLink.findFirst({
          where: {
            secret: shareLinkSecret,
          },
          include: {
            collection: true,
          },
        });
        if (!link) {
          return null;
        }

        return {
          id: shareLinkSecret,
          collectionId: link.collection.id,
          name: link.collection.title,
        };
      },
    }),
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID as string,
      clientSecret: process.env.KEYCLOAK_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER,
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async session(params: any) {
      return {
        ...params.session,
        user: {
          ...params.session.user,
          id: params.token.sub ?? params.token.id,
          collectionId: params.token.collectionId,
        },
        resource_access: params.token.resource_access,
        error: params.token.error,
      };
    },
    jwt(params: any) {
      if ("user" in params) {
        // check if guest user.
        // if so, the collectionId is defined on the user.
        if (params.user.collectionId) {
          return {
            ...params.user,
          };
        }
      }
      if (params.profile) {
        params.token.resource_access = params.profile.resource_access;
      }
      if (params.account) {
        params.token.accessToken = params.account.access_token;
        params.token.expiresAt = params.account.expires_at * 1000;
        params.token.refreshToken = params.account.refresh_token;
        params.token.idToken = params.account.id_token;

        return params.token;
      }

      if (Date.now() < params.token.expiresAt) {
        return params.token;
      }
      return refreshAccessToken(params.token);
    },
  },
};
