import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for countdown timer
 * @param {number} initialSeconds - Initial countdown time in seconds (default: 60)
 * @param {function} onExpire - Callback when countdown expires
 * @returns {object} { timeLeft, isRunning, start, reset, pause }
 */
export const useCountdown = (initialSeconds = 60, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onExpire) {
              onExpire();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, onExpire]);

  const start = useCallback(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    timeLeft,
    formattedTime: formatTime(),
    isRunning,
    start,
    reset,
    pause,
  };
};
