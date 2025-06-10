import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/Navigation';
import Home from './components/Home';
import VocabularyLesson from './components/VocabularyLesson';
import Scores from './components/Scores';
import Statistics from './components/Statistics';
import WordMatching from './components/WordMatching';
import Toast from './components/Toast';
import ProgressHeader from './components/ProgressHeader';
import { UserProgress } from './types';
import { storeItems } from './components/Store';
import './styles/components.css';
import AuthPage from './pages/Auth/AuthPage';
import { useAuth } from './hooks/useAuth';

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

// Sample words for the matching game
const sampleWords = [
  { word: "Hello", translation: "Hola", category: "Greetings" },
  { word: "Goodbye", translation: "Adiós", category: "Greetings" },
  { word: "Thank you", translation: "Gracias", category: "Courtesy" },
  { word: "Please", translation: "Por favor", category: "Courtesy" },
  { word: "Good morning", translation: "Buenos días", category: "Greetings" },
];

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

function App() {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    accuracyPoints: 0,
    speedPoints: 0,
    ownedItems: [],
    wordStats: {},
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleWordAttempt = (word: string, isCorrect: boolean, timeTaken: number) => {
    setUserProgress(prev => {
      const currentStats = prev.wordStats[word] || {
        word,
        attempts: 0,
        correctAttempts: 0,
        attemptTimes: [],
      };

      return {
        ...prev,
        wordStats: {
          ...prev.wordStats,
          [word]: {
            ...currentStats,
            attempts: currentStats.attempts + 1,
            correctAttempts: currentStats.correctAttempts + (isCorrect ? 1 : 0),
            attemptTimes: [...currentStats.attemptTimes, timeTaken],
          },
        },
      };
    });
  };

  const handlePurchase = (itemId: string) => {
    const item = storeItems.find(i => i.id === itemId);
    if (!item) return;

    if (userProgress.accuracyPoints >= item.price.accuracyPoints &&
        userProgress.speedPoints >= item.price.speedPoints) {
      setUserProgress(prev => ({
        ...prev,
        accuracyPoints: prev.accuracyPoints - item.price.accuracyPoints,
        speedPoints: prev.speedPoints - item.price.speedPoints,
        ownedItems: [...prev.ownedItems, itemId]
      }));
      setToast({
        message: `Successfully purchased ${item.name}!`,
        type: 'success'
      });
    } else {
      setToast({
        message: 'Not enough points to purchase this item',
        type: 'error'
      });
    }
  };

  const handleSell = (itemId: string) => {
    const item = storeItems.find(i => i.id === itemId);
    if (!item) return;

    const sellPrice = {
      accuracyPoints: Math.floor(item.price.accuracyPoints * 0.7),
      speedPoints: Math.floor(item.price.speedPoints * 0.7)
    };

    setUserProgress(prev => ({
      ...prev,
      accuracyPoints: prev.accuracyPoints + sellPrice.accuracyPoints,
      speedPoints: prev.speedPoints + sellPrice.speedPoints,
      ownedItems: prev.ownedItems.filter(id => id !== itemId)
    }));

    setToast({
      message: `Sold ${item.name} for ${sellPrice.accuracyPoints} ⭐ and ${sellPrice.speedPoints} ⚡`,
      type: 'success'
    });
  };

  const handlePointsEarned = (accuracyPoints: number, speedPoints: number) => {
    setUserProgress(prev => ({
      ...prev,
      accuracyPoints: prev.accuracyPoints + accuracyPoints,
      speedPoints: prev.speedPoints + speedPoints,
    }));
  };

  const handleMatchingComplete = (score: number) => {
    // Award points based on score
    const accuracyPoints = score * 10;  // 10 points per match
    const speedPoints = score * 5;      // 5 speed points per match
    
    handlePointsEarned(accuracyPoints, speedPoints);
    setToast({
      message: `Great job! You earned ${accuracyPoints} ⭐ and ${speedPoints} ⚡`,
      type: 'success'
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="App">
                    <ProgressHeader userProgress={userProgress} />
                    <Navigation />
                    <main className="app-main">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route 
                          path="/vocabulary" 
                          element={
                            <VocabularyLesson 
                              userProgress={userProgress} 
                              onPointsEarned={handlePointsEarned} 
                              onPurchase={handlePurchase} 
                              onSell={handleSell} 
                              onWordAttempt={handleWordAttempt} 
                            />
                          } 
                        />
                        <Route path="/scores" element={<Scores userProgress={userProgress} />} />
                        <Route path="/statistics" element={<Statistics wordStats={userProgress.wordStats} />} />
                        <Route
                          path="/matching"
                          element={
                            <WordMatching
                              words={sampleWords}
                              userProgress={userProgress}
                              onComplete={handleMatchingComplete}
                              onPointsEarned={handlePointsEarned}
                              onPurchase={handlePurchase}
                              onSell={handleSell}
                            />
                          }
                        />
                        <Route path="/sentences" element={<div className="coming-soon">Sentence Building - Coming Soon!</div>} />
                      </Routes>
                    </main>
                    {toast && (
                      <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                      />
                    )}
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
