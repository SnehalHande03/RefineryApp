import React, { useState } from 'react';
import './Navigation.css';

const Navigation = ({ isAuthenticated, user, onLogin, onLogout, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">FG</span>
          <span className="logo-text">FlowGuard <strong>AI</strong></span>
        </div>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li className="nav-item">
              <button className="nav-link" onClick={() => handleNavClick('landing')}>
                Home
              </button>
            </li>
            <li className="nav-item">
              <a href="#features" className="nav-link">
                Features
              </a>
            </li>
            <li className="nav-item">
              <a href="#about" className="nav-link">
                About
              </a>
            </li>
            <li className="nav-item">
              <a href="#contact" className="nav-link">
                Contact
              </a>
            </li>
          </ul>

          <div className="nav-auth">
            {isAuthenticated && user ? (
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-avatar">U</span>
                  <div className="user-details">
                    <span className="user-name">{user.name || 'User'}</span>
                    <span className="user-email">{user.email || ''}</span>
                  </div>
                </div>
                <button className="nav-button logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="nav-button login-btn" onClick={onLogin}>
                Sign In
              </button>
            )}
          </div>
        </div>

        <button className="hamburger" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;


