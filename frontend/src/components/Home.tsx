import React from 'react';
import { Link } from 'react-router-dom';

const activities = [
  {
    id: 'vocabulary',
    title: 'Learn Words',
    description: 'Learn new words with fun and interactive exercises',
    icon: '📚',
    path: '/vocabulary'
  },
  {
    id: 'matching',
    title: 'Match Words',
    description: 'Test your vocabulary by matching words with their meanings',
    icon: '🎮',
    path: '/matching'
  },
  {
    id: 'sentences',
    title: 'Complete Sentences',
    description: 'Practice forming complete sentences with the words you learned',
    icon: '✏️',
    path: '/sentences'
  }
];

const Home: React.FC = () => {
  return (
    <div className="home">
      <h1>Welcome to English Learning! 🌟</h1>
      <p className="home-intro">Choose an activity to start learning:</p>
      
      <div className="activity-grid">
        {activities.map(activity => (
          <Link 
            key={activity.id}
            to={activity.path}
            className="activity-card"
          >
            <div className="activity-icon">{activity.icon}</div>
            <h2>{activity.title}</h2>
            <p>{activity.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home; 