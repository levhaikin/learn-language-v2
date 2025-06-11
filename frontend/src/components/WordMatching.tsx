import React, { useState, useEffect } from 'react';
import { Word } from '../types/vocabulary';
import { UserProgress } from '../types';
import PointsPopup, { PointsPopupProps } from './PointsPopup';
import Store from './Store';
import '../styles/WordMatching.css';
import '../styles/components.css';

export interface WordPair {
  word: string;
  translation: string;
  category: string;
}

interface WordMatchingProps {
  words: WordPair[];
}

interface WordCard {
  text: string;
  type: 'word' | 'translation';
  pairId: number;
  id: string;
  isMatched: boolean;
  isWrong?: boolean;
}

// Time thresholds in milliseconds
const SPEED_THRESHOLDS = {
  SUPER_FAST: 1500,  // 1.5 seconds
  FAST: 3000,        // 3 seconds
  MEDIUM: 5000       // 5 seconds
};

const SPEED_POINTS = {
  SUPER_FAST: 15,    // Under 1.5 seconds
  FAST: 10,         // Under 3 seconds
  MEDIUM: 5,        // Under 5 seconds
  SLOW: 0           // Above 5 seconds
};

const BASE_ACCURACY_POINTS = 10;

const getSpeedPoints = (timeTaken: number): number => {
  if (timeTaken < SPEED_THRESHOLDS.SUPER_FAST) return SPEED_POINTS.SUPER_FAST;
  if (timeTaken < SPEED_THRESHOLDS.FAST) return SPEED_POINTS.FAST;
  if (timeTaken < SPEED_THRESHOLDS.MEDIUM) return SPEED_POINTS.MEDIUM;
  return SPEED_POINTS.SLOW;
};

const getSpeedFeedback = (speedPoints: number): string => {
  switch (speedPoints) {
    case SPEED_POINTS.SUPER_FAST:
      return 'Lightning fast! 🚀';
    case SPEED_POINTS.FAST:
      return 'Very quick! ⚡';
    case SPEED_POINTS.MEDIUM:
      return 'Good timing! ⌚';
    default:
      return 'Keep practicing! 💪';
  }
};

const WordMatching: React.FC<WordMatchingProps> = ({ words }) => {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<WordCard | null>(null);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [totalAccuracyPoints, setTotalAccuracyPoints] = useState(0);
  const [totalSpeedPoints, setTotalSpeedPoints] = useState(0);
  const [pointsPopup, setPointsPopup] = useState<Omit<PointsPopupProps, 'onClose'> | null>(null);

  useEffect(() => {
    // Create pairs of cards (word + translation)
    const cardPairs = words.flatMap((word, index) => [
      {
        text: word.word,
        type: 'word' as const,
        pairId: index,
        id: `word-${index}`,
        isMatched: false,
      },
      {
        text: word.translation,
        type: 'translation' as const,
        pairId: index,
        id: `translation-${index}`,
        isMatched: false,
      },
    ]);
    
    // Shuffle all cards
    setCards(shuffleArray(cardPairs));
    setStartTime(Date.now());
  }, [words]);

  // Update timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10); // Update every 10ms for smooth millisecond display

    return () => clearInterval(timer);
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  const handleCardClick = async (card: WordCard, event: React.MouseEvent) => {
    if (card.isMatched || card.id === selectedCard?.id || isChecking) return;

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      setIsChecking(true);
      const timeTaken = Date.now() - startTime;
      
      // Check if the cards form a matching pair
      if (card.pairId === selectedCard.pairId && card.type !== selectedCard.type) {
        // Match found
        const updatedCards = cards.map((c) =>
          c.pairId === card.pairId ? { ...c, isMatched: true } : c
        );
        setCards(updatedCards);
        setScore(score + 1);

        // Calculate points
        const accuracyPoints = BASE_ACCURACY_POINTS;
        const speedPoints = getSpeedPoints(timeTaken);
        const speedFeedback = getSpeedFeedback(speedPoints);
        
        setTotalAccuracyPoints(prev => prev + accuracyPoints);
        setTotalSpeedPoints(prev => prev + speedPoints);

        // Show points popup
        const rect = event.currentTarget.getBoundingClientRect();
        setPointsPopup({
          accuracyPoints,
          speedPoints,
          speedFeedback,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          },
        });

        // Check if all pairs are matched
        if (updatedCards.every((c) => c.isMatched)) {
          // onComplete?.(score + 1);
        }
      } else {
        // Wrong match - show feedback
        const updatedCards = cards.map((c) =>
          c.id === card.id || c.id === selectedCard.id
            ? { ...c, isWrong: true }
            : c
        );
        setCards(updatedCards);
        
        // Wait and remove wrong match indication
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCards(cards.map(c => ({ ...c, isWrong: false })));
      }
      setSelectedCard(null);
      setIsChecking(false);
      setStartTime(Date.now()); // Reset timer for next match attempt
    }
  };

  const elapsedTime = currentTime - startTime;

  return (
    <div className="word-matching-container">
      <div className="match-header">
        <div className="score">Matches Found: {score} / {words.length}</div>
        <div className="timer">Time: {formatTime(elapsedTime)}</div>
        <div className="points">
          <div>⭐ Accuracy Points: {totalAccuracyPoints}</div>
          <div>⚡ Speed Points: {totalSpeedPoints}</div>
        </div>
      </div>
      <div className="word-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            className={`word-card ${card.isMatched ? 'matched' : ''} ${
              selectedCard?.id === card.id ? 'selected' : ''
            } ${card.type === 'translation' ? 'translation-card' : ''} ${
              card.isWrong ? 'wrong' : ''
            }`}
            onClick={(e) => handleCardClick(card, e)}
            disabled={card.isMatched || isChecking}
          >
            {card.text}
          </button>
        ))}
      </div>
      {pointsPopup && (
        <PointsPopup
          {...pointsPopup}
          onClose={() => setPointsPopup(null)}
        />
      )}
      <Store
        userProgress={{} as UserProgress}
        onPurchase={(itemId: string) => {}}
        onSell={(itemId: string) => {}}
      />
    </div>
  );
};

export default WordMatching; 