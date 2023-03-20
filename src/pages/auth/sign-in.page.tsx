import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export default function SignIn() {
  const { status, data } = useSession();
  const router = useRouter();
  const ref = useRef<"idle" | "redirecting">("idle");

  useEffect(() => {
    if (status === "unauthenticated") {
      // check the query
      if (router.query.secret) {
        console.log("Signing in with credentials");
        void signIn("credentials", {
          shareLinkSecret: router.query.secret as string,
          callbackUrl: "/dashboard",
        });
        return;
      }

      void signIn("keycloak");
    } else if (status === "authenticated") {
      if (ref.current === "idle") {
        ref.current = "redirecting";
        void router.push("/dashboard");
      }
    }
  }, [router, status, data]);

  return null;
}
