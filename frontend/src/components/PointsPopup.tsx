import React, { useEffect } from 'react';
import '../styles/PointsPopup.css';

export interface PointsPopupProps {
  accuracyPoints: number;
  speedPoints: number;
  speedFeedback: string;
  position: { x: number; y: number };
  onClose?: () => void;
  autoCloseDelay?: number; // in milliseconds
}

const PointsPopup: React.FC<PointsPopupProps> = ({
  accuracyPoints,
  speedPoints,
  speedFeedback,
  position,
  onClose,
  autoCloseDelay = 2000, // default to 2 seconds
}) => {
  useEffect(() => {
    if (onClose && autoCloseDelay > 0) {
      const timeout = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timeout);
    }
  }, [onClose, autoCloseDelay]);

  return (
    <div 
      className="points-popup"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
    >
      <div className="points-popup-content">
        <div className="speed-feedback">{speedFeedback}</div>
        <div className="points-earned">
          <div>+{accuracyPoints} ⭐</div>
          {speedPoints > 0 && (
            <div>+{speedPoints} ⚡</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsPopup; 