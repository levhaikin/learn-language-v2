import React, { useState, useEffect, useRef } from 'react';
import { api, Word, WordImage } from '../services/api';
import Timer from './Timer';
import PointsPopup from './PointsPopup';
import { TextField, Button, Box, Stack } from '@mui/material';

interface VocabularyLessonProps {}

const VocabularyLesson: React.FC<VocabularyLessonProps> = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showMeaning) return;

    setIsTimerRunning(false);
    const currentWord = words[currentWordIndex];
    const isAnswerCorrect = inputValue.trim().toLowerCase() === currentWord.translation.toLowerCase();

    if (isAnswerCorrect) {
      const hintPenalty = showHint ? 5 : 0;
      const accuracyPoints = 10 - hintPenalty;
      const speedPoints = Math.max(0, 10 - Math.floor((Date.now() - startTime) / 1000));
      
      setEarnedPoints({ accuracy: accuracyPoints, speed: speedPoints });
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }

    setShowMeaning(true);
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
            <h2>{currentWord.word}</h2>
            {imageLoading ? (
              <div className="image-placeholder">Loading image...</div>
            ) : (
              currentImage && <img src={currentImage.url} alt={currentImage.alt} className="word-image" />
            )}
            <p className="pronunciation">/{currentWord.pronunciation}/</p>
            {showMeaning && (
              <p className={`meaning ${isCorrect ? 'correct' : 'incorrect'}`}>
                {currentWord.translation}
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
                  placeholder="Type the translation"
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
    </div>
  );
};

export default VocabularyLesson;
