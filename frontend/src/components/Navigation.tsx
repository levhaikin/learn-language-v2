import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Divider,
  ListItemIcon,
  Typography
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Navigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { onSignOut } = useAuth();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onSignOut();
  };

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
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={Boolean(anchorEl) ? 'profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>U</Avatar>
          </IconButton>
        </div>
      </nav>
      {getBreadcrumbs()}
      
      <Menu
        anchorEl={anchorEl}
        id="profile-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>U</Avatar>
          <Typography variant="body1" sx={{ ml: 1 }}>My Profile</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </header>
  );
};

export default Navigation; 