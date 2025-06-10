import React, { useState, useEffect } from 'react';
import { WordStats } from '../types';
import WrongAttemptsPlot from './WrongAttemptsPlot';
import { storageInstance } from '../storage/storageInstance';
import { WordAttempt } from '../types/history';

interface StatisticsProps {
  wordStats?: { [key: string]: WordStats }; // now optional, not used
}

type SortKey = 'word' | 'attempts' | 'successRate' | 'failedRate' | 'bestTime' | 'medianTime' | 'slowestTime';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const Statistics: React.FC<StatisticsProps> = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'attempts',
    direction: 'desc'
  });
  const [wordStats, setWordStats] = useState<{ [key: string]: WordStats }>({});

  useEffect(() => {
    async function fetchAndAggregate() {
      const attempts: WordAttempt[] = await storageInstance.getAllAttempts();
      // Aggregate attempts into wordStats
      const statsMap: { [key: string]: WordStats } = {};
      for (const attempt of attempts) {
        if (!statsMap[attempt.word]) {
          statsMap[attempt.word] = {
            word: attempt.word,
            attempts: 0,
            correctAttempts: 0,
            attemptTimes: [],
          };
        }
        statsMap[attempt.word].attempts += 1;
        if (attempt.isCorrect) statsMap[attempt.word].correctAttempts += 1;
        statsMap[attempt.word].attemptTimes.push(attempt.timeTaken);
      }
      setWordStats(statsMap);
    }
    fetchAndAggregate();
  }, []);

  const calculateStats = (stats: WordStats) => {
    const correctRate = (stats.correctAttempts / stats.attempts) * 100;
    const failedRate = 100 - correctRate;
    
    // Sort times for calculating statistics
    const sortedTimes = [...stats.attemptTimes].sort((a, b) => a - b);
    const peakSpeed = sortedTimes[0] || 0;
    const lowestSpeed = sortedTimes[sortedTimes.length - 1] || 0;
    
    // Calculate median speed
    const mid = Math.floor(sortedTimes.length / 2);
    const medianSpeed = sortedTimes.length % 2 === 0
      ? (sortedTimes[mid - 1] + sortedTimes[mid]) / 2
      : sortedTimes[mid];

    return {
      correctRate,
      failedRate,
      peakSpeed,
      lowestSpeed,
      medianSpeed,
    };
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = () => {
    const statsArray = Object.values(wordStats).map(stats => {
      const calculated = calculateStats(stats);
      return {
        ...stats,
        ...calculated,
      };
    });

    return statsArray.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortConfig.key) {
        case 'word':
          aValue = a.word.toLowerCase();
          bValue = b.word.toLowerCase();
          break;
        case 'attempts':
          aValue = a.attempts;
          bValue = b.attempts;
          break;
        case 'successRate':
          aValue = a.correctRate;
          bValue = b.correctRate;
          break;
        case 'failedRate':
          aValue = a.failedRate;
          bValue = b.failedRate;
          break;
        case 'bestTime':
          aValue = a.peakSpeed;
          bValue = b.peakSpeed;
          break;
        case 'medianTime':
          aValue = a.medianSpeed;
          bValue = b.medianSpeed;
          break;
        case 'slowestTime':
          aValue = a.lowestSpeed;
          bValue = b.lowestSpeed;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="statistics">
      <h1>Word Statistics</h1>
      <WrongAttemptsPlot />
      {Object.keys(wordStats).length > 0 ? (
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('word')} className="sortable">
                  Word{getSortIcon('word')}
                </th>
                <th onClick={() => requestSort('attempts')} className="sortable">
                  Attempts{getSortIcon('attempts')}
                </th>
                <th onClick={() => requestSort('successRate')} className="sortable">
                  Success Rate{getSortIcon('successRate')}
                </th>
                <th onClick={() => requestSort('failedRate')} className="sortable">
                  Failed Rate{getSortIcon('failedRate')}
                </th>
                <th onClick={() => requestSort('bestTime')} className="sortable">
                  Best Time{getSortIcon('bestTime')}
                </th>
                <th onClick={() => requestSort('medianTime')} className="sortable">
                  Median Time{getSortIcon('medianTime')}
                </th>
                <th onClick={() => requestSort('slowestTime')} className="sortable">
                  Slowest Time{getSortIcon('slowestTime')}
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedItems().map((stats) => (
                <tr key={stats.word}>
                  <td className="word-cell">{stats.word}</td>
                  <td>{stats.attempts}</td>
                  <td>
                    <span className="success-rate">
                      {stats.correctRate.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className="failed-rate">
                      {stats.failedRate.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className="peak-speed">
                      {formatTime(stats.peakSpeed)}
                    </span>
                  </td>
                  <td>
                    <span className="median-speed">
                      {formatTime(stats.medianSpeed)}
                    </span>
                  </td>
                  <td>
                    <span className="lowest-speed">
                      {formatTime(stats.lowestSpeed)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-stats">
          <p>No word statistics available yet. Start practicing to see your progress!</p>
        </div>
      )}
    </div>
  );
};

export default Statistics;
