import { useCallback, useEffect, useRef } from "react";

export function useStateUpdateBatcher<T>(state: T) {
  const currentResolve = useRef<(value: unknown) => void>(() => {});
  const promiseThread = useRef<Promise<unknown>>(
    new Promise((res) => res("initial")),
  );

  const batchAction = useCallback((action: VoidFunction) => {
    promiseThread.current.then(
      () =>
        new Promise((res) => {
          currentResolve.current = res;
          action();
        }),
    );
  }, []);

  useEffect(() => {
    currentResolve.current("initial");
  }, [state]);

  return { batchAction };
}
