import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_LIMIT_MS = 15* 1000; // 15 minutes

const WARNING_1_MS = 10* 60* 1000; // 10 minutes
const WARNING_2_MS = 5 * 60 * 1000;  // 5 minutes after warning 1
const FINAL_COUNTDOWN_SEC = 10;      // 10 seconds final countdown

interface InactivityCallbacks {
  onWarning1?: () => void;
  onWarning2?: () => void;
  onFinalCountdownTick?: (secondsRemaining: number) => void;
  onInactive: () => void;
  onReset?: () => void; // Called when timer resets (optional)
}

function formatMsToMinutesSeconds(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function useInactivityTimer({
  onWarning1,
  onWarning2,
  onFinalCountdownTick,
  onInactive,
  onReset,
}: InactivityCallbacks) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const warning1Timer = useRef<NodeJS.Timeout | null>(null);
  const warning2Timer = useRef<NodeJS.Timeout | null>(null);
  const finalCountdownInterval = useRef<NodeJS.Timeout | null>(null);
  const finalCountdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const countdownLoggerInterval = useRef<NodeJS.Timeout | null>(null);
  const targetTime = useRef<number>(Date.now() + INACTIVITY_LIMIT_MS);

  const clearAllTimers = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (warning1Timer.current) {
      clearTimeout(warning1Timer.current);
      warning1Timer.current = null;
    }
    if (warning2Timer.current) {
      clearTimeout(warning2Timer.current);
      warning2Timer.current = null;
    }
    if (finalCountdownInterval.current) {
      clearInterval(finalCountdownInterval.current);
      finalCountdownInterval.current = null;
    }
    if (finalCountdownTimeout.current) {
      clearTimeout(finalCountdownTimeout.current);
      finalCountdownTimeout.current = null;
    }
    if (countdownLoggerInterval.current) {
      clearInterval(countdownLoggerInterval.current);
      countdownLoggerInterval.current = null;
    }
  };

  const resetTimer = useCallback(() => {
    clearAllTimers();

    const now = Date.now();
    targetTime.current = now + INACTIVITY_LIMIT_MS;

    if (onReset) onReset();

    // Warning 1 at 14 minutes
    warning2Timer.current = setTimeout(() => {
      if (onWarning2) onWarning2();
    }, WARNING_2_MS); // 5 minutes elapsed
    
    warning1Timer.current = setTimeout(() => {
      if (onWarning1) onWarning1();
    }, WARNING_1_MS); // 10 minutes elapsed
    

    // Start inactivity logout timeout
    timer.current = setTimeout(() => {
      if (finalCountdownInterval.current) {
        clearInterval(finalCountdownInterval.current);
        finalCountdownInterval.current = null;
      }
      if (countdownLoggerInterval.current) {
        clearInterval(countdownLoggerInterval.current);
        countdownLoggerInterval.current = null;
      }
      onInactive();
    }, INACTIVITY_LIMIT_MS);

    // Start 10-second final countdown 10 seconds before logout
    finalCountdownTimeout.current = setTimeout(() => {
      let secondsRemaining = FINAL_COUNTDOWN_SEC;
      if (finalCountdownInterval.current) {
        clearInterval(finalCountdownInterval.current);
      }
      finalCountdownInterval.current = setInterval(() => {
        if (secondsRemaining <= 0) {
          if (finalCountdownInterval.current) {
            clearInterval(finalCountdownInterval.current);
            finalCountdownInterval.current = null;
          }
          return;
        }
        if (onFinalCountdownTick) onFinalCountdownTick(secondsRemaining);
        secondsRemaining -= 1;
      }, 1000);
    }, INACTIVITY_LIMIT_MS - FINAL_COUNTDOWN_SEC * 1000);

    // Log countdown every second to console in MM:SS format
    countdownLoggerInterval.current = setInterval(() => {
      const remaining = targetTime.current - Date.now();
      if (remaining <= 0) {
        clearAllTimers();
        return;
      }
      console.log(`Inactivity timer remaining: ${formatMsToMinutesSeconds(remaining)}`);
    }, 1000);
  }, [onWarning1, onWarning2, onFinalCountdownTick, onInactive, onReset]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearAllTimers();
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return { resetTimer };
}
