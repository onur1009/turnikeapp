import { useState, useEffect, useRef, useCallback } from 'react';

export function useGameTimer(initialSeconds, onExpire, onTick) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  
  const requestRef = useRef();
  const startTimeRef = useRef();
  const initialTimeRef = useRef(initialSeconds * 1000);
  const pausedRemainingRef = useRef(null);
  
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const tick = useCallback((time) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    const remaining = Math.max(0, initialTimeRef.current - elapsed);
    const newSeconds = Math.ceil(remaining / 1000);
    
    setTimeLeft((prev) => {
      if (prev !== newSeconds) return newSeconds;
      return prev;
    });

    if (onTickRef.current) {
      onTickRef.current(remaining);
    }

    if (remaining > 0) {
      requestRef.current = requestAnimationFrame(tick);
    } else {
      requestRef.current = null;
      setIsRunning(false);
      if (onExpireRef.current) onExpireRef.current();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const startTimer = useCallback((seconds) => {
    initialTimeRef.current = seconds * 1000;
    setTimeLeft(seconds);
    startTimeRef.current = null;
    pausedRemainingRef.current = null;
    setIsRunning(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = null;
    pausedRemainingRef.current = null;
  }, []);

  // Duraklat/devam: kalan süre saklanır. Eskiden uygulama arka plana alınınca geçen süre de düşülüyordu
  // (rAF durur ama geçen süre başlangıç anından hesaplanır).
  const pauseTimer = useCallback(() => {
    if (!requestRef.current || pausedRemainingRef.current !== null || !startTimeRef.current) return;
    cancelAnimationFrame(requestRef.current);
    requestRef.current = null;
    pausedRemainingRef.current = Math.max(0, initialTimeRef.current - (performance.now() - startTimeRef.current));
    setIsRunning(false);
  }, []);
  const resumeTimer = useCallback(() => {
    if (pausedRemainingRef.current === null) return;
    initialTimeRef.current = pausedRemainingRef.current;
    pausedRemainingRef.current = null;
    startTimeRef.current = null;
    setIsRunning(true);
    requestRef.current = requestAnimationFrame(tick);
  }, [tick]);

  return { timeLeft, startTimer, stopTimer, pauseTimer, resumeTimer, isRunning };
}
