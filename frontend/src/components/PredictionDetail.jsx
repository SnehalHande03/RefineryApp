import React from 'react';
import './PredictionDetail.css';

const PredictionDetail = ({ prediction, onBack }) => {
  if (!prediction) {
    return (
      <div className="prediction-detail-container">
        <div className="empty-state">
          <p>No prediction available</p>
          <button onClick={onBack}>← Go Back</button>
        </div>
      </div>
    );
  }

  // Determine status color and icon
  const isFailure = prediction.prediction === 1;
  const statusClass = isFailure ? 'failure' : 'normal';
  const statusIcon = isFailure ? '⚠️' : '✓';
  const statusText = isFailure ? 'FAILURE RISK DETECTED' : 'MACHINE OPERATING NORMALLY';

  return (
    <div className="prediction-detail-container">
      {/* Header */}
      <header className="prediction-header">
        <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
        <div className="header-title">
          <h1>Sensor Prediction Analysis</h1>
          <p className="machine-info">Machine ID: {prediction.machine_id}</p>
        </div>
        <div className="timestamp">
          {new Date(prediction.timestamp).toLocaleString()}
        </div>
      </header>

      {/* Main Content */}
      <main className="prediction-content">
        {/* Status Section */}
        <section className={`prediction-section status-section ${statusClass}`}>
          <div className="status-icon">{statusIcon}</div>
          <div className="status-info">
            <h2>{statusText}</h2>
            <div className="confidence">
              <span className="confidence-label">Confidence Level:</span>
              <span className="confidence-value">{Math.round((prediction.failure_confidence || 0) * 100)}%</span>
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${(prediction.failure_confidence || 0) * 100}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Sensor Readings */}
        <section className="prediction-section">
          <h2>📊 Input Sensor Readings</h2>
          <div className="sensor-readings-grid">
            <div className="reading-card">
              <div className="reading-label">Temperature</div>
              <div className="reading-value">{prediction.temperature}°C</div>
              <div className="reading-range">Range: 10-150°C</div>
              {prediction.temperature > 90 && <div className="reading-warning">⚠️ High</div>}
            </div>

            <div className="reading-card">
              <div className="reading-label">Pressure</div>
              <div className="reading-value">{prediction.pressure} bar</div>
              <div className="reading-range">Range: 0-100 bar</div>
              {prediction.pressure > 80 && <div className="reading-warning">⚠️ High</div>}
            </div>

            <div className="reading-card">
              <div className="reading-label">Vibration</div>
              <div className="reading-value">{prediction.vibration.toFixed(2)} mm/s</div>
              <div className="reading-range">Normal: {'<'}2.3 mm/s</div>
              {prediction.vibration > 2.3 && <div className="reading-warning">⚠️ Abnormal</div>}
            </div>

            <div className="reading-card">
              <div className="reading-label">Flow Rate</div>
              <div className="reading-value">{Math.round(prediction.flow_rate)} L/min</div>
              <div className="reading-range">Varies by equipment</div>
            </div>

            <div className="reading-card">
              <div className="reading-label">Humidity</div>
              <div className="reading-value">{prediction.humidity.toFixed(1)}%</div>
              <div className="reading-range">Range: 0-100%</div>
            </div>
          </div>
        </section>

        {/* Explanation */}
        {prediction.explanation && (
          <section className="prediction-section">
            <h2>🔍 Root Cause Analysis</h2>
            <div className="explanation-box">
              <p>{prediction.explanation}</p>
            </div>
          </section>
        )}

        {/* Top Contributing Factors */}
        {prediction.top_factors && prediction.top_factors.length > 0 && (
          <section className="prediction-section">
            <h2>🎯 Top Contributing Factors</h2>
            <div className="factors-list">
              {prediction.top_factors.map((factor, idx) => (
                <div key={idx} className="factor-item">
                  <div className="factor-rank">{idx + 1}</div>
                  <div className="factor-info">
                    <div className="factor-name">{factor.name}</div>
                    <div className="factor-bar">
                      <div 
                        className="factor-fill" 
                        style={{ width: `${factor.importance * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="factor-value">{Math.round(factor.importance * 100)}%</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Triggered Alerts */}
        {prediction.triggered_alerts && prediction.triggered_alerts.length > 0 && (
          <section className="prediction-section">
            <h2>🚨 Triggered Alerts ({prediction.triggered_alerts.length})</h2>
            <div className="alerts-list">
              {prediction.triggered_alerts.map((alert, idx) => (
                <div key={idx} className={`alert-notification ${alert.severity.toLowerCase()}`}>
                  <span className="alert-severity">{alert.severity}</span>
                  <div>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-desc">{alert.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {prediction.recommendations && prediction.recommendations.length > 0 && (
          <section className="prediction-section recommendations-section">
            <h2>💡 Recommended Actions</h2>
            <div className="recommendations-list">
              {Array.isArray(prediction.recommendations) && prediction.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <span className="rec-number">{idx + 1}</span>
                  <div className="rec-content">
                    <p>{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Stats */}
        <section className="prediction-section stats-section">
          <h2>📈 Summary</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div className={`stat-value ${statusClass}`}>
                {isFailure ? 'FAILURE RISK' : 'NORMAL'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sensors Abnormal</div>
              <div className="stat-value">
                {[
                  prediction.temperature > 90,
                  prediction.pressure > 80,
                  prediction.vibration > 2.3
                ].filter(Boolean).length}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Alert Level</div>
              <div className={`stat-value ${isFailure ? 'critical' : 'normal'}`}>
                {isFailure ? 'CRITICAL' : 'NORMAL'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Confidence</div>
              <div className="stat-value">{Math.round((prediction.failure_confidence || 0) * 100)}%</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Action */}
      <footer className="prediction-footer">
        <button className="back-button large" onClick={onBack}>
          ← Return to Dashboard
        </button>
      </footer>
    </div>
  );
};

export default PredictionDetail;
