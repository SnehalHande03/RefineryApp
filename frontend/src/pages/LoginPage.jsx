import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin, onBackClick }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      if (email && password.length >= 6) {
        const user = {
          id: 1,
          name: email.split('@')[0],
          email: email,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');

        onLogin(user);
      } else {
        setError('Invalid credentials. Try any email and password (min 6 chars)');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <button className="back-button" onClick={onBackClick}>
            Back
          </button>
          <h1>{isSignUp ? 'Create Your Account' : 'Secure Sign In'}</h1>
          <p>{isSignUp ? 'Sign up for FlowGuard AI monitoring' : 'Sign in to your FlowGuard AI dashboard'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete={isSignUp ? 'email' : 'username'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      <div className="login-visual">
        <div className="visual-element">
          <div className="visual-head">
            <h2>01</h2>
            <p>Industrial IoT Monitoring</p>
          </div>
          <div className="visual-art monitoring-art">
            <span className="bar b1"></span>
            <span className="bar b2"></span>
            <span className="bar b3"></span>
            <span className="bar b4"></span>
            <span className="bar b5"></span>
          </div>
        </div>

        <div className="visual-element">
          <div className="visual-head">
            <h2>02</h2>
            <p>Secure Access</p>
          </div>
          <div className="visual-art security-art">
            <div className="shield">
              <div className="lock"></div>
            </div>
          </div>
        </div>

        <div className="visual-element">
          <div className="visual-head">
            <h2>03</h2>
            <p>Real-Time Analytics</p>
          </div>
          <div className="visual-art analytics-art">
            <div className="line-path"></div>
            <span className="dot d1"></span>
            <span className="dot d2"></span>
            <span className="dot d3"></span>
            <span className="dot d4"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


