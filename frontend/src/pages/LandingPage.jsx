import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onLoginClick }) => {
  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="highlight">Predictive Maintenance</span>
              <br />
              for Industrial Excellence
            </h1>
            <p className="hero-subtitle">
              AI-powered real-time monitoring and failure prediction for industrial equipment.
              Prevent breakdowns, optimize maintenance, and maximize uptime.
            </p>

            <button className="hero-cta" onClick={onLoginClick}>
              Launch Dashboard
            </button>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">94%</span>
                <span className="stat-label">Prediction Accuracy</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5</span>
                <span className="stat-label">Sensor Types</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Real-Time</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="live-badge">
                <span className="live-dot" />
                Live Data
              </div>
              <div className="chart-animation">
                <div className="bar" style={{ height: '40%' }}></div>
                <div className="bar" style={{ height: '65%' }}></div>
                <div className="bar" style={{ height: '55%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '50%' }}></div>
              </div>
              <div className="pulse-ring ring-1" />
              <div className="pulse-ring ring-2" />
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need for industrial equipment monitoring</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">ML</div>
            <h3>ML-Powered Predictions</h3>
            <p>Advanced Random Forest algorithm predicts equipment failures before they happen with 94% accuracy.</p>
            <ul className="feature-list">
              <li>Binary classification</li>
              <li>Feature importance analysis</li>
              <li>Confidence scoring</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">RT</div>
            <h3>Real-Time Analytics</h3>
            <p>Monitor temperature, pressure, vibration, flow rate, and humidity with interactive charts.</p>
            <ul className="feature-list">
              <li>Live sensor data</li>
              <li>Trend analysis</li>
              <li>Custom dashboards</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">AL</div>
            <h3>Intelligent Alerts</h3>
            <p>Automatic alert generation with severity levels based on sensor anomalies and predictions.</p>
            <ul className="feature-list">
              <li>Multi-tier severity</li>
              <li>Smart notifications</li>
              <li>Alert tracking</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">RP</div>
            <h3>Maintenance Reports</h3>
            <p>Comprehensive analytics, failure trends, and AI-powered recommendations.</p>
            <ul className="feature-list">
              <li>7-day analysis</li>
              <li>Priority levels</li>
              <li>Export options</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">RC</div>
            <h3>Root Cause Analysis</h3>
            <p>Understand exactly which sensors contributed to each prediction.</p>
            <ul className="feature-list">
              <li>Feature importance</li>
              <li>Top 3 sensors</li>
              <li>Detailed explanations</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">SE</div>
            <h3>Enterprise Security</h3>
            <p>Secure authentication and data protection for sensitive industrial data.</p>
            <ul className="feature-list">
              <li>User authentication</li>
              <li>Data encryption</li>
              <li>Access control</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="quick-stats-section" id="about">
        <div className="stats-container">
          <div className="stat-box interactive-stat">
            <span className="stat-icon">01</span>
            <div className="stat-details">
              <div className="stat-value">Real-Time</div>
              <p>Live Monitoring</p>
            </div>
          </div>
          <div className="stat-box interactive-stat">
            <span className="stat-icon">02</span>
            <div className="stat-details">
              <div className="stat-value">94%</div>
              <p>Accuracy</p>
            </div>
          </div>
          <div className="stat-box interactive-stat">
            <span className="stat-icon">03</span>
            <div className="stat-details">
              <div className="stat-value">5 Sensors</div>
              <p>Multi-metric</p>
            </div>
          </div>
          <div className="stat-box interactive-stat">
            <span className="stat-icon">04</span>
            <div className="stat-details">
              <div className="stat-value">Instant</div>
              <p>Alerts</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer" id="contact">
        <div className="footer-bottom">
          <p>FlowGuard AI | Industrial Intelligence | support@flowguard.local</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


