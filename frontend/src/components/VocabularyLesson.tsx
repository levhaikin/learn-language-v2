import React, { useState, useEffect, useRef } from 'react';
import { UserProgress } from '../types';
import Store from './Store';
import Timer from './Timer';
import PointsPopup from './PointsPopup';
import { api, Word, WordImage } from '../services/api';

interface VocabularyLessonProps {
  userProgress: UserProgress;
  onPointsEarned: (accuracyPoints: number, speedPoints: number) => void;
  onPurchase: (itemId: string) => void;
  onSell: (itemId: string) => void;
  onWordAttempt: (word: string, isCorrect: boolean, timeTaken: number) => void;
}

const VocabularyLesson: React.FC<VocabularyLessonProps> = ({
  userProgress,
  onPointsEarned,
  onPurchase,
  onSell,
  onWordAttempt
}) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintPenalty, setHintPenalty] = useState(0);
  const [currentImage, setCurrentImage] = useState<WordImage | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pointsPopup, setPointsPopup] = useState<{
    accuracyPoints: number;
    speedPoints: number;
    speedFeedback: string;
    position: { x: number; y: number };
  } | null>(null);

  // Load words from API
  useEffect(() => {
    const loadWords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedWords = await api.vocabulary.getAll();
        setWords(fetchedWords);
        setCurrentWordIndex(0);
      } catch (err) {
        setError('Failed to load vocabulary. Please try again.');
        console.error('Error loading vocabulary:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadWords();
  }, []);

  // Load word image when current word changes
  useEffect(() => {
    const loadWordImage = async () => {
      if (!words[currentWordIndex]) return;
      
      setIsLoadingImage(true);
      setCurrentImage(null);
      try {
        const image = await api.images.getWordImage(words[currentWordIndex].word);
        setCurrentImage(image);
      } catch (error) {
        console.error('Failed to load image:', error);
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadWordImage();
  }, [currentWordIndex, words]);

  const currentWord = words[currentWordIndex];

  const nextWord = () => {
    const nextIndex = (currentWordIndex + 1) % words.length;
    setCurrentWordIndex(nextIndex);
    resetWordState();
  };

  const resetWordState = () => {
    setStartTime(Date.now());
    setShowMeaning(false);
    setShowHint(false);
    setHintPenalty(0);
    setUserGuess('');
    setFeedback('');
    setIsCorrect(false);
    inputRef.current?.focus();
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

    const isAnswerCorrect = userGuess.toLowerCase() === currentWord.word.toLowerCase();
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    onWordAttempt(currentWord.word, isAnswerCorrect, timeTaken);
    
    if (isAnswerCorrect) {
      try {
        // Record the attempt
        await api.attempts.create({
          word: currentWord.word,
          isCorrect: true,
          timeTaken,
          category: currentWord.category
        });

        // Calculate points
        const accuracyPoints = 10 - hintPenalty; // Base points minus hint penalty
        let speedPoints = 0;
        let speedFeedback = '';

        if (timeTaken < 1500) {
          speedPoints = 15;
          speedFeedback = 'Super Fast! 🚀';
        } else if (timeTaken < 3000) {
          speedPoints = 10;
          speedFeedback = 'Great Speed! ⚡';
        } else if (timeTaken < 5000) {
          speedPoints = 5;
          speedFeedback = 'Good Timing! 👍';
        } else {
          speedFeedback = 'Keep Practicing! 💪';
        }

        // Show points popup
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
      } catch (error) {
        console.error('Failed to record attempt:', error);
        // Continue with the game even if recording fails
      }
    } else {
      setFeedback('Try again!');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading vocabulary...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!currentWord) {
    return <div className="error">No vocabulary words available.</div>;
  }

  return (
    <div className="vocabulary-lesson">
      <div className="word-card">
        <div className="word-image">
          {isLoadingImage ? (
            <div className="image-loading">Loading image...</div>
          ) : currentImage ? (
            <img 
              src={currentImage.url} 
              alt={currentImage.alt}
              className="word-image-photo"
            />
          ) : (
            <div className="image-fallback">{currentWord?.word}</div>
          )}
        </div>
        <div className="word-meaning">
          <h2>{currentWord?.translation}</h2>
          {showHint && currentWord?.hint && (
            <p className="hint">{currentWord.hint}</p>
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
        {feedback && <p className="feedback">{feedback}</p>}
        {showMeaning && (
          <>
            <h3 className="word-text">{currentWord.word}</h3>
            {currentWord.pronunciation && (
              <p className="pronunciation">/{currentWord.pronunciation}/</p>
            )}
            <p className="meaning">{currentWord.definition}</p>
            {currentWord.examples && currentWord.examples.length > 0 && (
              <div className="examples">
                <h4>Examples:</h4>
                <ul>
                  {currentWord.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
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
