import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_LIMIT_MS = 15* 60 * 1000; // 10 mintues


export function useInactivityTimer(onInactive: () => void) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {  
      onInactive();
    }, INACTIVITY_LIMIT_MS);
  }, [onInactive]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); 

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);
}
