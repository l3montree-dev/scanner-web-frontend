import { useState } from "react";

export default function useLoading(isLoading = false, err = "") {
  const [loading, setLoading] = useState({
    isLoading,
    err,
  });

  return {
    loading: () => setLoading({ isLoading: true, err: "" }),
    success: () => setLoading({ isLoading: false, err: "" }),
    error: (err: string) => setLoading({ isLoading: false, err }),
    isLoading: loading.isLoading,
    errorMessage: loading.err,
    errored: !!loading.err,
  };
}
