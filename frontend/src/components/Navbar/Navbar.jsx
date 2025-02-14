import React, { useState, useRef, useEffect } from 'react';
import { FiSun, FiMoon, FiTrash2, FiGithub, FiLogIn, FiSearch, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ 
  searchQuery, 
  onSearchChange, 
  suggestions, 
  onStreamSelect,
  streamsPerRow,
  onStreamsPerRowChange,
  onClearAll,
  streamsCount,
  userInfo,
  onLogin,
  onLogout,
  theme,
  onThemeToggle
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <a href="/" className="navbar-logo">
            <img src="/assets/logo.png" alt="MultiTwitch" />
          </a>
        </div>

        <div className="navbar-center">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher un streamer..."
                className="search-input"
              />
              <FiSearch className="search-icon" />
              <button className="clear-button" onClick={handleClear}>
                <FiX className="clear-icon" />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((suggestion) => (
                  <div 
                    key={suggestion.id}
                    onClick={() => onStreamSelect(suggestion)}
                    className="suggestion-item"
                    data-live={suggestion.isLive}
                  >
                    <img 
                      src={suggestion.profileImage} 
                      alt={suggestion.name}
                      className="suggestion-avatar"
                    />
                    <div className="suggestion-info">
                      <div className="suggestion-name">
                        {suggestion.name}
                        {suggestion.isLive && (
                          <span className="live-badge">LIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <select 
            value={streamsPerRow} 
            onChange={(e) => onStreamsPerRowChange(Number(e.target.value))}
            className="streams-per-row-select"
          >
            <option value={2}>2 POV</option>
            <option value={3}>3 POV</option>
            <option value={4}>4 POV</option>
          </select>
        </div>
        
        <div className="navbar-right">
          {streamsCount > 0 && (
            <button 
              className="clear-all-button"
              onClick={onClearAll}
              title="Effacer tous les streams"
            >
              <FiTrash2 size={20} />
            </button>
          )}
          <button 
            className="theme-toggle" 
            onClick={onThemeToggle}
            title={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          
          <a 
            href="https://github.com/LoganDELMAIRE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
          >
            <FiGithub size={20} />
          </a>
          {userInfo ? (
            <div className="user-info" ref={profileMenuRef}>
              <button 
                className="profile-button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <img 
                  src={userInfo.profile_image_url} 
                  alt={userInfo.display_name}
                  className="user-avatar"
                />
              </button>
              {isProfileMenuOpen && (
                <div className="user-dropdown">
                  <span className="user-name">{userInfo.display_name}</span>
                  <button onClick={onLogout} className="logout-button">
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLogin} className="login-button">
              <FiLogIn size={20} />
              Se connecter avec Twitch
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 