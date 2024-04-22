import { getServerSession } from "next-auth";
import React from "react";
import { staticSecrets } from "../utils/staticSecrets";

import { authOptions } from "../nextAuthOptions";

export function withNotAvailable<P extends { displayNotAvailable: boolean }>(
  Component: React.ComponentType<P>
) {
  return async function WithAuthProvider(
    props: Omit<P, "displayNotAvailable"> & {
      searchParams: Record<string, string>;
    }
  ) {
    const code = props.searchParams["s"];

    const session = await getServerSession(authOptions);

    const displayNotAvailable = false; //  session === null &&(!Boolean(code) || code === null || !staticSecrets[code]);

    return (
      <Component
        displayNotAvailable={displayNotAvailable}
        {...(props as any)}
      />
    );
  };
}
