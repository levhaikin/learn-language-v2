import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, CircularProgress } from '@mui/material';
import Navigation from './components/Navigation';
import Home from './components/Home';
import VocabularyLesson from './components/VocabularyLesson';
import Scores from './components/Scores';
import Statistics from './components/Statistics';
import WordMatching from './components/WordMatching';
import ProgressHeader from './components/ProgressHeader';
import './styles/components.css';
import AuthPage from './pages/Auth/AuthPage';
import { useAuth } from './hooks/useAuth';

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
                    <ProgressHeader />
                    <Navigation />
                    <main className="app-main">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/vocabulary" element={<VocabularyLesson />} />
                        <Route path="/scores" element={<Scores />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route
                          path="/matching"
                          element={<WordMatching words={sampleWords} />}
                        />
                        <Route path="/sentences" element={<div className="coming-soon">Sentence Building - Coming Soon!</div>} />
                      </Routes>
                    </main>
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
