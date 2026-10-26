import React, { useEffect, useState } from 'react';

import { formatKurus as formatValue } from '../utils/format';

const AnimatedBalance = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;

    setIsAnimating(true);
    let startTimestamp = null;
    const duration = 800; // ms
    const startValue = displayValue;
    const difference = value - startValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(startValue + difference * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <span
      className={`font-mono transition-colors duration-300 ${isAnimating && value > displayValue ? 'text-green-400' : isAnimating && value < displayValue ? 'text-red-400' : ''}`}
    >
      {formatValue(displayValue)}
    </span>
  );
};

export default React.memo(AnimatedBalance);
