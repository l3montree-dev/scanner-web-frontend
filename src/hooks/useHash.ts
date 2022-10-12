import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useHash() {
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash.replace("#", "") : ""
  );
  const router = useRouter();

  useEffect(() => {
    const onHashChangeStart = (url: string) => {
      setHash(url.split("#")[1].replace("#", ""));
    };

    router.events.on("hashChangeStart", onHashChangeStart);

    return () => {
      router.events.off("hashChangeStart", onHashChangeStart);
    };
  }, [router.events]);

  return hash;
}
