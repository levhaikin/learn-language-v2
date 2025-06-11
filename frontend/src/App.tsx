import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, CircularProgress, Fab } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
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
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    accuracyPoints: 0,
    speedPoints: 0,
    ownedItems: []
  });

  // Load user progress data
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const scores = await storageInstance.getUserScores();
        if (scores) {
          setUserProgress({
            accuracyPoints: scores.accuracyPoints,
            speedPoints: scores.speedPoints,
            ownedItems: scores.ownedItems || []
          });
        }
      } catch (error) {
        console.error('Failed to load user progress:', error);
      }
    };

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

        await storageInstance.saveUserScores({
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

      await storageInstance.saveUserScores({
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
                        <Route path="/vocabulary" element={<VocabularyLesson />} />
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
                    <Box
                      sx={{
                        position: 'fixed',
                        bottom: isStoreOpen ? '0' : '-400px',
                        left: '0',
                        right: '0',
                        height: '400px',
                        backgroundColor: 'background.paper',
                        boxShadow: 3,
                        borderTop: '2px solid',
                        borderColor: 'primary.main',
                        transition: 'bottom 0.3s ease-in-out',
                        zIndex: 1200,
                        overflow: 'hidden'
                      }}
                    >
                      <Store
                        userProgress={userProgress}
                        onPurchase={handlePurchase}
                        onSell={handleSell}
                      />
                    </Box>

                    {/* Store Toggle Button */}
                    <Fab
                      color="primary"
                      aria-label="store"
                      sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1300
                      }}
                      onClick={() => setIsStoreOpen(!isStoreOpen)}
                    >
                      <StorefrontIcon />
                    </Fab>
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
