"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useNotification(duration = 2600) {
  const [notification, setNotification] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const notify = useCallback(
    (message: string) => {
      setNotification(message);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotification(null), duration);
    },
    [duration],
  );
  return { notification, notify };
}
