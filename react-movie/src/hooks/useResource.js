import { useEffect, useState } from "react";

// A new loader invalidates old data immediately. Aborted/stale requests cannot
// overwrite the current filter, search or detail page.
export default function useResource(load) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      data => {
        if (!controller.signal.aborted) setResult({ load, attempt, data });
      },
      error => {
        if (!controller.signal.aborted) setResult({ load, attempt, error });
      },
    );
    return () => controller.abort();
  }, [load, attempt]);
  const current = result?.load === load && result?.attempt === attempt;
  return {
    data: current ? result.data : null,
    error: current ? result.error : null,
    loading: !current,
    retry: () => setAttempt(value => value + 1),
  };
}
