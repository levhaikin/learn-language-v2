import React, { useState, useEffect, useRef } from 'react';
import { api, Word, WordImage } from '../services/api';
import Timer from './Timer';
import PointsPopup from './PointsPopup';
import WrongPopup from './WrongPopup';
import { TextField, Button, Box, Stack } from '@mui/material';
import { storageInstance } from '../storage/storageInstance';
import { WordAttempt } from '../types/history';

interface VocabularyLessonProps {
  onScoresUpdated?: () => void;
}

const VocabularyLesson: React.FC<VocabularyLessonProps> = ({ onScoresUpdated }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [currentImage, setCurrentImage] = useState<WordImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState({ accuracy: 0, speed: 0 });
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  const [startTime, setStartTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const fetchWords = async () => {
    try {
      const allWords = await api.vocabulary.getAll();
      setWords(allWords);
      if (allWords.length > 0) {
        fetchWordImage(allWords[0].word);
        setStartTime(Date.now());
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.error('Failed to fetch words', error);
    }
  };

  const fetchWordImage = async (word: string) => {
    if (!word) return;
    setImageLoading(true);
    try {
      const imageData = await api.images.getWordImage(word);
      setCurrentImage(imageData);
    } catch (error) {
      console.error('Failed to fetch image for', word, error);
      setCurrentImage(null);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleNextWord = () => {
    setShowMeaning(false);
    setInputValue('');
    setIsCorrect(null);
    setShowHint(false);
    const nextIndex = currentWordIndex + 1;
    if (nextIndex < words.length) {
      setCurrentWordIndex(nextIndex);
      fetchWordImage(words[nextIndex].word);
      setStartTime(Date.now());
      setIsTimerRunning(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showMeaning) return;

    setIsTimerRunning(false);
    const currentWord = words[currentWordIndex];
    const isAnswerCorrect = inputValue.trim().toLowerCase() === currentWord.word.toLowerCase();
    console.log(inputValue);
    console.log(currentWord);
    const timeTaken = Date.now() - startTime;

    // Calculate points
    const hintPenalty = showHint ? 5 : 0;
    const accuracyPoints = isAnswerCorrect ? (10 - hintPenalty) : 0;
    const speedPoints = isAnswerCorrect ? Math.max(0, 10 - Math.floor(timeTaken / 1000)) : 0;

    // Create attempt record
    const attempt: WordAttempt = {
      word: currentWord.word,
      userAnswer: inputValue.trim(),
      isCorrect: isAnswerCorrect,
      timestamp: Date.now(),
      timeTaken: timeTaken,
      accuracyPoints: accuracyPoints,
      speedPoints: speedPoints,
      category: currentWord.category,
      hintUsed: showHint,
      attemptsCount: 1
    };

    try {
      // Save the attempt
      await storageInstance.saveAttempt(attempt);

      // Update user scores if correct
      if (isAnswerCorrect) {
        const currentState = await storageInstance.getUserState();
        const newState = {
          accuracyPoints: (currentState?.accuracyPoints || 0) + accuracyPoints,
          speedPoints: (currentState?.speedPoints || 0) + speedPoints,
          ownedItems: currentState?.ownedItems || [],
          timestamp: Date.now()
        };
        
        await storageInstance.saveUserState(newState);
        
        // Notify App.tsx that scores were updated
        onScoresUpdated?.();
        
        setEarnedPoints({ accuracy: accuracyPoints, speed: speedPoints });
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
      } else {
        // incorrect answer feedback
        setShowWrongPopup(true);
        setTimeout(() => setShowWrongPopup(false), 1500);
      }
    } catch (error) {
      console.error('Failed to save attempt or update scores:', error);
    }

    if (isAnswerCorrect) {
      setShowMeaning(true);
    }
    setIsCorrect(isAnswerCorrect);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  if (words.length === 0) {
    return <div>Loading vocabulary...</div>;
  }

  if (currentWordIndex >= words.length) {
    return <div>Lesson complete!</div>;
  }

  const currentWord = words[currentWordIndex];

  return (
    <div className="vocabulary-lesson">
      <div className="lesson-content">
        <div className="word-card-container">
          <div className="word-card">
            <Timer isRunning={isTimerRunning} startTime={startTime} />
            {/* Word is hidden to prompt recall */}
            {imageLoading ? (
              <div className="image-placeholder">Loading image...</div>
            ) : (
              currentImage && <img src={currentImage.url} alt={currentImage.alt} className="word-image" />
            )}
            {showMeaning && (
              <p className={`meaning ${isCorrect ? 'correct' : 'incorrect'}`}>
                {currentWord.meaning}
              </p>
            )}
            {showHint && !showMeaning && (
              <p className="hint">
                <strong>Hint:</strong> {currentWord.hint}
              </p>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Stack direction="row" spacing={1}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type the word"
                  disabled={showMeaning}
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={showMeaning}
                  size="large"
                >
                  Check
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleHint} 
                  disabled={showMeaning || showHint}
                >
                  Hint
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleNextWord} 
                  disabled={!showMeaning}
                >
                  Next Word
                </Button>
              </Stack>
            </Box>
          </div>
        </div>
      </div>
      
      {/* Points Popup */}
      {showPopup && (
        <PointsPopup
          accuracyPoints={earnedPoints.accuracy}
          speedPoints={earnedPoints.speed}
          speedFeedback={earnedPoints.speed >= 8 ? "Lightning fast!" : earnedPoints.speed >= 5 ? "Great speed!" : earnedPoints.speed >= 3 ? "Good timing!" : "Nice work!"}
          position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
          onClose={() => setShowPopup(false)}
        />
      )}
      {/* Wrong answer popup */}
      {showWrongPopup && (
        <WrongPopup
          message="Try again!"
          position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 - 80 }}
        />
      )}
    </div>
  );
};

export default VocabularyLesson;
