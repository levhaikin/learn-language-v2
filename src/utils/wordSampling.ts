import { Word, WordStats } from '../types';

const softmax = (numbers: number[]): number[] => {
  // Apply exponential and normalize
  const maxNum = Math.max(...numbers);
  const expValues = numbers.map(n => Math.exp(n - maxNum)); // Subtract max for numerical stability
  const sumExp = expValues.reduce((a, b) => a + b, 0);
  return expValues.map(exp => exp / sumExp);
};

export const getNextWordIndex = (
  words: Word[],
  wordStats: { [key: string]: WordStats },
  currentIndex: number = -1
): number => {
  // Calculate failure rates for each word
  const failureRates = words.map((word, index) => {
    // Return -Infinity for current word to ensure it's never selected
    if (index === currentIndex) {
      return -Infinity;
    }
    
    const stats = wordStats[word.word];
    if (!stats || stats.attempts === 0) {
      // If no attempts yet, use a high failure rate to encourage sampling
      return 1.0;
    }
    return (stats.attempts - stats.correctAttempts) / stats.attempts;
  });

  // Convert failure rates to probabilities using softmax
  const probabilities = softmax(failureRates.map(rate => rate * 5)); // Multiply by 5 to make distribution more pronounced
  
  // Sample from the probability distribution
  const random = Math.random();
  let cumulativeProb = 0;
  
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProb += probabilities[i];
    if (random < cumulativeProb) {
      return i;
    }
  }

  // Fallback to random index (excluding current)
  const availableIndices = Array.from({length: words.length}, (_, i) => i)
    .filter(i => i !== currentIndex);
  return availableIndices[Math.floor(Math.random() * availableIndices.length)];
}; 