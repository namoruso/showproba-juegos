import { useEffect, useRef, useState } from 'react';

/** Cuenta regresiva en segundos. Llama a onEnd una vez al llegar a 0. */
export function useCountdown(seconds, { running = true, onEnd } = {}) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (!running) return undefined;
    if (left <= 0) {
      endRef.current?.();
      return undefined;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left, running]);

  return [left, setLeft];
}

export const formatTime = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
