import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'dashboard'
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (isAuthenticated && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLoginClick = () => {
    if (user) {
      setCurrentPage('dashboard');
      return;
    }
    setCurrentPage('login');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleBackFromLogin = () => {
    setCurrentPage('landing');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('landing');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      <Navigation 
        isAuthenticated={!!user}
        user={user}
        onLogin={handleLoginClick}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      
      {currentPage === 'landing' && (
        <LandingPage onLoginClick={handleLoginClick} />
      )}
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} onBackClick={handleBackFromLogin} />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;


