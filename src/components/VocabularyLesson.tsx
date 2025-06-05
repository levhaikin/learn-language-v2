import React, { useState, useEffect, useRef } from 'react';
import { Word, UserProgress, WordStats } from '../types';
import { WordAttempt } from '../types/history';
import { UserScores } from '../types/scores';
import Store from './Store';
import Timer from './Timer';
import { getNextWordIndex } from '../utils/wordSampling';
import { getWordImage } from '../utils/imageAPI';
import PointsPopup from './PointsPopup';
import vocabularyData from '../data/vocabulary.json';
import { historyStorage } from '../storage/storageInstance';

// Extend Word type to include image URL, alt text, and hint
interface WordWithImage extends Word {
  imageUrl?: string;
  imageAlt?: string;
  hint?: string;
}

// Convert the categorized vocabulary data into a flat array of words
const words: WordWithImage[] = vocabularyData.words.reduce((acc: WordWithImage[], category) => {
  return [...acc, ...category.items];
}, []);

interface VocabularyLessonProps {
  userProgress: UserProgress;
  onPointsEarned: (accuracyPoints: number, speedPoints: number) => void;
  onPurchase: (itemId: string) => void;
  onSell: (itemId: string) => void;
  onWordAttempt: (word: string, isCorrect: boolean, timeTaken: number) => void;
}

const SPEED_THRESHOLDS = {
  SUPER_FAST: 2000,  // 2 seconds
  FAST: 5000,        // 5 seconds
  MEDIUM: 7000       // 7 seconds
};

const SPEED_POINTS = {
  SUPER_FAST: 15,    // Under 2 seconds
  FAST: 10,         // Under 5 seconds
  MEDIUM: 5,        // Under 7 seconds
  SLOW: 0           // Above 7 seconds
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

const VocabularyLesson: React.FC<VocabularyLessonProps> = ({
  userProgress,
  onPointsEarned,
  onPurchase,
  onSell,
  onWordAttempt
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(() => 
    getNextWordIndex(words, userProgress.wordStats)
  );
  const [currentWordData, setCurrentWordData] = useState<WordWithImage>(words[currentWordIndex]);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [hintPenalty, setHintPenalty] = useState(0);
  const [wordAttempts, setWordAttempts] = useState<WordAttempt[]>([]);
  const [currentAttemptCount, setCurrentAttemptCount] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pointsPopup, setPointsPopup] = useState<{
    accuracyPoints: number;
    speedPoints: number;
    speedFeedback: string;
    position: { x: number; y: number };
  } | null>(null);

  // Load initial scores from storage - only once on component mount
  useEffect(() => {
    const loadScores = async () => {
      try {
        const savedScores = await historyStorage.getUserScores();
        if (savedScores) {
          // Update the userProgress with saved scores if they exist
          // But don't add to existing points, just set them if they're higher
          const totalCurrentPoints = userProgress.accuracyPoints + userProgress.speedPoints;
          const totalSavedPoints = savedScores.accuracyPoints + savedScores.speedPoints;
          
          // Only update if saved scores are higher than current scores
          if (totalSavedPoints > totalCurrentPoints) {
            onPointsEarned(
              Math.max(0, savedScores.accuracyPoints - userProgress.accuracyPoints),
              Math.max(0, savedScores.speedPoints - userProgress.speedPoints)
            );
          }
        }
      } catch (error) {
        console.error('Failed to load scores:', error);
      }
    };
    loadScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to ensure it only runs once

  useEffect(() => {
    const loadWordImage = async () => {
      setIsLoadingImage(true);
      const wordData = words[currentWordIndex];
      if (!wordData.imageUrl) {
        try {
          const image = await getWordImage(wordData.word);
          wordData.imageUrl = image.url;
          wordData.imageAlt = image.alt;
        } catch (error) {
          console.error('Failed to load image:', error);
        }
      }
      setCurrentWordData(wordData);
      setIsLoadingImage(false);
    };

    loadWordImage();
    setStartTime(Date.now());
    setShowMeaning(false);
    setShowHint(false);
    setHintPenalty(0);
    setUserGuess('');
    setFeedback('');
    setIsCorrect(false);
    setCurrentAttemptCount(1);
    inputRef.current?.focus();
  }, [currentWordIndex]);

  const nextWord = () => {
    setCurrentWordIndex(getNextWordIndex(words, userProgress.wordStats, currentWordIndex));
  };

  const handleShowHint = () => {
    if (!showHint && !isCorrect) {
      setShowHint(true);
      setHintPenalty(5);
    }
  };

  const checkAnswer = async () => {
    if (isCorrect) {
      nextWord();
      return;
    }

    const isAnswerCorrect = userGuess.toLowerCase() === currentWordData.word.toLowerCase();
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    onWordAttempt(currentWordData.word, isAnswerCorrect, timeTaken);
    
    // Create word attempt record
    const accuracyPoints = BASE_ACCURACY_POINTS - hintPenalty;
    const speedPoints = getSpeedPoints(timeTaken);
    
    const attempt: WordAttempt = {
      word: currentWordData.word,
      userAnswer: userGuess,
      isCorrect: isAnswerCorrect,
      timestamp: endTime,
      timeTaken: timeTaken,
      accuracyPoints: isAnswerCorrect ? accuracyPoints : 0,
      speedPoints: isAnswerCorrect ? speedPoints : 0,
      category: vocabularyData.words.find(cat => 
        cat.items.some(item => item.word === currentWordData.word)
      )?.category || 'Unknown',
      hintUsed: showHint,
      attemptsCount: currentAttemptCount
    };

    // Add attempt to history and save to storage
    setWordAttempts(prevAttempts => [...prevAttempts, attempt]);
    try {
      await historyStorage.saveAttempt(attempt);

      if (isAnswerCorrect) {
        try {
          // Get current scores
          const currentScores = await historyStorage.getUserScores() || {
            accuracyPoints: 0,
            speedPoints: 0,
            totalPoints: 0,
            lastUpdated: Date.now()
          };

          // Calculate new scores
          const newScores: UserScores = {
            accuracyPoints: currentScores.accuracyPoints + accuracyPoints,
            speedPoints: currentScores.speedPoints + speedPoints,
            totalPoints: currentScores.totalPoints + accuracyPoints + speedPoints,
            lastUpdated: Date.now()
          };

          // Save updated scores
          await historyStorage.saveUserScores(newScores);
        } catch (error) {
          console.error('Failed to update scores in localStorage:', error);
          // Continue with the game even if localStorage fails
        }
      }
    } catch (error) {
      console.error('Failed to save data:', error);
    }
    
    if (isAnswerCorrect) {
      const speedFeedback = getSpeedFeedback(speedPoints);
      
      // Get the input element position for the popup
      const inputElement = inputRef.current?.getBoundingClientRect();
      if (inputElement) {
        setPointsPopup({
          accuracyPoints,
          speedPoints,
          speedFeedback,
          position: {
            x: inputElement.left + inputElement.width / 2,
            y: inputElement.top,
          },
        });
      }

      onPointsEarned(accuracyPoints, speedPoints);
      setShowMeaning(true);
      setIsCorrect(true);
    } else {
      setFeedback('Try again!');
      setCurrentAttemptCount(prev => prev + 1);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
    }
  };

  return (
    <div className="vocabulary-lesson">
      <div className="word-card">
        <div className="word-image">
          {isLoadingImage ? (
            <div className="image-loading">Loading...</div>
          ) : currentWordData.imageUrl ? (
            <img 
              src={currentWordData.imageUrl} 
              alt={currentWordData.imageAlt || currentWordData.word}
              className="word-image-photo"
            />
          ) : (
            <div className="image-fallback">{currentWordData.word}</div>
          )}
        </div>
        <Timer isRunning={!isCorrect} startTime={startTime} />
        <div className="word-input">
          <input
            ref={inputRef}
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Type the word..."
            onKeyPress={handleKeyPress}
            disabled={isCorrect}
          />
          <button 
            onClick={checkAnswer}
            onFocus={() => inputRef.current?.focus()}
          >
            {isCorrect ? 'Next Word' : 'Check'}
          </button>
          {!isCorrect && !showMeaning && (
            <button 
              onClick={handleShowHint}
              className="hint-button"
              disabled={showHint}
            >
              {showHint ? 'Hint Used (-5 pts)' : 'Show Hint'}
            </button>
          )}
        </div>
        {showHint && !isCorrect && currentWordData.hint && (
          <p className="hint-text">Hint: {currentWordData.hint}</p>
        )}
        {feedback && <p className="feedback">{feedback}</p>}
        {showMeaning && (
          <>
            <h3 className="word-text">{currentWordData.word}</h3>
            <p className="pronunciation">/{currentWordData.pronunciation}/</p>
            <p className="meaning">{currentWordData.meaning}</p>
          </>
        )}
      </div>
      {pointsPopup && (
        <PointsPopup
          {...pointsPopup}
          onClose={() => setPointsPopup(null)}
        />
      )}
      <Store
        userProgress={userProgress}
        onPurchase={onPurchase}
        onSell={onSell}
      />
    </div>
  );
};

export default VocabularyLesson;
