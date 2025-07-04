import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, CircularProgress } from '@mui/material';
import Navigation from './components/Navigation';
import Home from './components/Home';
import VocabularyLesson from './components/VocabularyLesson';
import Scores from './components/Scores';
import Statistics from './components/Statistics';
import WordMatching from './components/WordMatching';
import ProgressHeader from './components/ProgressHeader';
import Store, { storeItems } from './components/Store';
import './styles/components.css';
import AuthPage from './pages/Auth/AuthPage';
import { useAuth } from './hooks/useAuth';
import { storageInstance } from './storage/storageInstance';
import { UserProgress } from './types';
import Footer from './components/Footer';

const sampleWords = [
  { word: "Hello", translation: "Hola", category: "Greetings" },
  { word: "Goodbye", translation: "Adiós", category: "Greetings" },
  { word: "Thank you", translation: "Gracias", category: "Courtesy" },
  { word: "Please", translation: "Por favor", category: "Courtesy" },
  { word: "Good morning", translation: "Buenos días", category: "Greetings" },
];

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
    ownedItems: []
  });

  // Load user progress data
  const loadUserProgress = async () => {
    try {
      const state = await storageInstance.getUserState();
      if (state) {
        setUserProgress({
          accuracyPoints: state.accuracyPoints,
          speedPoints: state.speedPoints,
          ownedItems: state.ownedItems || []
        });
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  useEffect(() => {
    loadUserProgress();
  }, []);

  const handlePurchase = async (itemId: string) => {
    try {
      // Find the item and check if user can afford it
      const item = storeItems.find(i => i.id === itemId);
      if (!item) return;

      if (userProgress.accuracyPoints >= item.price.accuracyPoints && 
          userProgress.speedPoints >= item.price.speedPoints) {
        
        const newProgress = {
          ...userProgress,
          accuracyPoints: userProgress.accuracyPoints - item.price.accuracyPoints,
          speedPoints: userProgress.speedPoints - item.price.speedPoints,
          ownedItems: [...userProgress.ownedItems, itemId]
        };

        await storageInstance.saveUserState({
          accuracyPoints: newProgress.accuracyPoints,
          speedPoints: newProgress.speedPoints,
          ownedItems: newProgress.ownedItems,
          timestamp: Date.now()
        });

        setUserProgress(newProgress);
      }
    } catch (error) {
      console.error('Failed to purchase item:', error);
    }
  };

  const handleSell = async (itemId: string) => {
    try {
      const item = storeItems.find(i => i.id === itemId);
      if (!item) return;

      const sellPrice = {
        accuracyPoints: Math.floor(item.price.accuracyPoints * 0.7),
        speedPoints: Math.floor(item.price.speedPoints * 0.7)
      };

      const newProgress = {
        ...userProgress,
        accuracyPoints: userProgress.accuracyPoints + sellPrice.accuracyPoints,
        speedPoints: userProgress.speedPoints + sellPrice.speedPoints,
        ownedItems: userProgress.ownedItems.filter(id => id !== itemId)
      };

      await storageInstance.saveUserState({
        accuracyPoints: newProgress.accuracyPoints,
        speedPoints: newProgress.speedPoints,
        ownedItems: newProgress.ownedItems,
        timestamp: Date.now()
      });

      setUserProgress(newProgress);
    } catch (error) {
      console.error('Failed to sell item:', error);
    }
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
                        <Route path="/vocabulary" element={<VocabularyLesson onScoresUpdated={loadUserProgress} />} />
                        <Route path="/scores" element={<Scores userProgress={userProgress} />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route
                          path="/matching"
                          element={<WordMatching words={sampleWords} />}
                        />
                        <Route path="/sentences" element={<div className="coming-soon">Sentence Building - Coming Soon!</div>} />
                      </Routes>
                    </main>
                    
                    {/* Global Store Drawer */}
                    <Store
                      userProgress={userProgress}
                      onPurchase={handlePurchase}
                      onSell={handleSell}
                    />

                    <Footer />
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
