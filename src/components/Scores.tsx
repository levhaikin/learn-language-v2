import React from 'react';
import { UserProgress } from '../types';
import { storeItems } from './Store';

interface ScoresProps {
  userProgress: UserProgress;
}

const Scores: React.FC<ScoresProps> = ({ userProgress }) => {
  return (
    <div className="scores">
      <h1>Your Progress 🏆</h1>
      
      <div className="score-cards">
        <div className="score-card">
          <div className="score-icon">⭐</div>
          <h2>Accuracy Points</h2>
          <div className="score-value">{userProgress.accuracyPoints}</div>
        </div>
        
        <div className="score-card">
          <div className="score-icon">⚡</div>
          <h2>Speed Points</h2>
          <div className="score-value">{userProgress.speedPoints}</div>
        </div>
      </div>

      <div className="achievements">
        <h2>Your Characters</h2>
        <div className="owned-items">
          {userProgress.ownedItems.length === 0 ? (
            <p className="no-items">Visit the store to get your first character!</p>
          ) : (
            userProgress.ownedItems.map(itemId => {
              const character = storeItems.find(item => item.id === itemId);
              return character ? (
                <div key={itemId} className="owned-item">
                  <div className="character-icon">{character.image}</div>
                  <h3>{character.name}</h3>
                  <p>{character.description}</p>
                </div>
              ) : null;
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Scores; 