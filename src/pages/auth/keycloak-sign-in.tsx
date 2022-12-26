import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export default function SignIn() {
  const { status, data } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log(
      localStorage.getItem("force-keycloak-signing-redirect") === null
    );
    if (localStorage.getItem("force-keycloak-signing-redirect") === null) {
      localStorage.setItem(
        "force-keycloak-signing-redirect",
        (router.query.redirectTo as string | undefined) ?? ""
      );
      console.log("KEYCLOAK SIGNIN");
      void signIn("keycloak");
    } else {
      const redirectTo = localStorage.getItem(
        "force-keycloak-signing-redirect"
      );
      localStorage.removeItem("force-keycloak-signing-redirect");
      console.log(redirectTo);
      void router.push(redirectTo ?? "/dashboard");
    }
  }, [router, status, data]);

  return null;
}
