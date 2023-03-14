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
        void signIn("ShareLink Login");
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
