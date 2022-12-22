import { useState } from "react";

export default function useLoading(isLoading = false, err = "") {
  const [loading, setLoading] = useState({
    isLoading,
    key: "",
    err,
  });

  return {
    loading: (key: string = "") =>
      setLoading({ isLoading: true, err: "", key }),
    success: () => setLoading({ isLoading: false, err: "", key: "" }),
    error: (err: string, key = "") =>
      setLoading({ isLoading: false, err, key }),
    isLoading: loading.isLoading,
    errorMessage: loading.err,
    errored: !!loading.err,
    key: loading.key,
  };
}
