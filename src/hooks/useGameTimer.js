import { useState, useEffect, useRef, useCallback } from 'react';

export function useGameTimer(initialSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  
  const requestRef = useRef();
  const startTimeRef = useRef();
  const initialTimeRef = useRef(initialSeconds * 1000);
  
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const tick = useCallback((time) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    const remaining = Math.max(0, initialTimeRef.current - elapsed);
    setTimeLeft(Math.ceil(remaining / 1000));

    if (remaining > 0) {
      requestRef.current = requestAnimationFrame(tick);
    } else {
      setIsRunning(false);
      if (onExpireRef.current) onExpireRef.current();
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, tick]);

  const startTimer = useCallback((seconds) => {
    initialTimeRef.current = seconds * 1000;
    setTimeLeft(seconds);
    startTimeRef.current = null;
    setIsRunning(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  return { timeLeft, startTimer, stopTimer, isRunning };
}
