import React from 'react';
import { UserProgress } from '../types';
import '../styles/ProgressHeader.css';

interface ProgressHeaderProps {
  userProgress: UserProgress;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ userProgress }) => {
  return (
    <header className="progress-header">
      <div className="progress-container">
        <div className="points-display">
          <div className="points-item">
            <span className="points-icon">⭐</span>
            <span className="points-value">{userProgress.accuracyPoints}</span>
            <span className="points-label">Accuracy Points</span>
          </div>
          <div className="points-item">
            <span className="points-icon">⚡</span>
            <span className="points-value">{userProgress.speedPoints}</span>
            <span className="points-label">Speed Points</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProgressHeader; 