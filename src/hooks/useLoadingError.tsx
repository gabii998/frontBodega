import { useCallback, useState } from "react";

export const useLoadingError = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const run = useCallback(
    async (fn: () => Promise<void>, errorMessage: string) => {
      try {
        setError(null);
        setLoading(true);
        await fn();
      } catch {
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const wrap = (fn: () => Promise<void>, message: string = '') => () => run(fn, message);


  return {
    loading,
    error,
    setLoading,
    setError,
    clearError,
    reset,
    wrap
  };
};