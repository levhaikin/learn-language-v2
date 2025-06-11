import React, { useEffect } from 'react';
import '../styles/WrongPopup.css';

interface WrongPopupProps {
  message: string;
  position: { x: number; y: number };
  onClose?: () => void;
  autoCloseDelay?: number; // ms
}

const WrongPopup: React.FC<WrongPopupProps> = ({ message, position, onClose, autoCloseDelay = 1500 }) => {
  useEffect(() => {
    if (onClose && autoCloseDelay > 0) {
      const t = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(t);
    }
  }, [onClose, autoCloseDelay]);

  return (
    <div
      className="wrong-popup"
      style={{ left: position.x, top: position.y, position: 'fixed' }}
    >
      <div className="wrong-popup-content">{message}</div>
    </div>
  );
};

export default WrongPopup; 