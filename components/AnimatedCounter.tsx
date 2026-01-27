import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  formatValue,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatted = formatValue
    ? formatValue(Math.round(displayValue))
    : Math.round(displayValue).toLocaleString('cs-CZ');

  return <span className={className}>{formatted}</span>;
};

// Pre-configured currency counter
export const AnimatedCurrency: React.FC<{
  value: number;
  className?: string;
  duration?: number;
}> = ({ value, className = '', duration = 1200 }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0
    }).format(val);

  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      formatValue={formatCurrency}
      className={className}
    />
  );
};

// Pre-configured percentage counter
export const AnimatedPercentage: React.FC<{
  value: number;
  className?: string;
  duration?: number;
}> = ({ value, className = '', duration = 800 }) => {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      formatValue={(val) => `${val}%`}
      className={className}
    />
  );
};

// Pre-configured number counter (for item counts)
export const AnimatedNumber: React.FC<{
  value: number;
  className?: string;
  duration?: number;
  suffix?: string;
}> = ({ value, className = '', duration = 800, suffix = '' }) => {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      formatValue={(val) => `${val}${suffix}`}
      className={className}
    />
  );
};

export default AnimatedCounter;
