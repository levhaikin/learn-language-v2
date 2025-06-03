import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBreadcrumbs = () => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return null;

    return (
      <div className="breadcrumbs">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}</span>
      </div>
    );
  };

  return (
    <header className="app-header">
      <nav className="main-nav">
        <Link to="/" className="nav-logo">
          English Learning App
        </Link>
        <div className="nav-right">
          <Link to="/" className="nav-link">
            🏠 Home
          </Link>
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="nav-dropdown-button">
              📚 Exercises <span className="dropdown-arrow">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="nav-dropdown-content">
                <Link to="/vocabulary" className="nav-dropdown-item">
                  📖 Vocabulary
                </Link>
                <Link to="/matching" className="nav-dropdown-item">
                  🎮 Matching
                </Link>
                <Link to="/sentences" className="nav-dropdown-item">
                  ✏️ Sentences
                </Link>
              </div>
            )}
          </div>
          <Link to="/scores" className="nav-link">
            🏆 Scores
          </Link>
          <Link to="/statistics" className="nav-link">
            📊 Statistics
          </Link>
        </div>
      </nav>
      {getBreadcrumbs()}
    </header>
  );
};

export default Navigation; 