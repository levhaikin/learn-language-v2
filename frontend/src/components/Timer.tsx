import React, { useState, useEffect } from 'react';

interface TimerProps {
  isRunning: boolean;
  startTime: number;
}

const THRESHOLDS = {
  SUPER_FAST: 2000,  // 2 seconds
  FAST: 5000,        // 5 seconds
  MEDIUM: 7000       // 7 seconds
};

const getTimerClass = (ms: number): string => {
  if (ms < THRESHOLDS.SUPER_FAST) return 'super-fast';
  if (ms < THRESHOLDS.FAST) return 'fast';
  if (ms < THRESHOLDS.MEDIUM) return 'medium';
  return 'slow';
};

const Timer: React.FC<TimerProps> = ({ isRunning, startTime }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10); // Update every 10ms for smooth millisecond display
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
  };

  return (
    <div className={`timer ${getTimerClass(elapsedTime)}`}>
      {formatTime(elapsedTime)}
    </div>
  );
};

export default Timer; 