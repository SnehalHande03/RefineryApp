import React, { useState } from 'react';
import { getPredictionExplanation } from '../services/api';
import './PredictionResult.css';

const PredictionResult = ({ result }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShowExplanation = async () => {
    if (showExplanation) {
      setShowExplanation(false);
      return;
    }

    setLoading(true);
    try {
      const exp = await getPredictionExplanation(result.id);
      setExplanation(exp);
      setShowExplanation(true);
    } catch (error) {
      alert('Error fetching explanation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!result) return null;

  const isFailurePredicted = result.failure_predicted;
  const confidence = Math.round(result.failure_confidence * 100);

  return (
    <div className="prediction-result-container">
      <div className={`prediction-card ${isFailurePredicted ? 'failure' : 'normal'}`}>
        <div className="prediction-status">
          <span className="status-icon">
            {isFailurePredicted ? '⚠️' : '✓'}
          </span>
          <div className="status-text">
            <h3>{isFailurePredicted ? 'FAILURE RISK DETECTED' : 'NORMAL OPERATION'}</h3>
            <p>Confidence: {confidence}%</p>
          </div>
        </div>

        <div className="prediction-details">
          <div className="detail-item">
            <span className="label">Machine ID:</span>
            <span className="value">{result.machine_id}</span>
          </div>
          <div className="detail-item">
            <span className="label">Timestamp:</span>
            <span className="value">{new Date(result.timestamp).toLocaleString()}</span>
          </div>
        </div>

        <button
          className={`explain-btn ${loading ? 'loading' : ''}`}
          onClick={handleShowExplanation}
          disabled={loading}
        >
          {loading ? 'Loading...' : showExplanation ? 'Hide Explanation' : 'Why? (Show Explanation)'}
        </button>
      </div>

      {showExplanation && explanation && (
        <div className="explanation-card">
          <h4>Prediction Explanation</h4>

          <div className="top-sensors">
            <h5>Top Contributing Sensors:</h5>
            {explanation.top_sensors.map((sensor, idx) => (
              <div key={idx} className={`sensor-item ${sensor.status}`}>
                <div className="sensor-header">
                  <span className="sensor-name">
                    {idx + 1}. {sensor.sensor.charAt(0).toUpperCase() + sensor.sensor.slice(1)}
                  </span>
                  <span className="sensor-status">{sensor.status.toUpperCase()}</span>
                </div>
                <div className="sensor-details">
                  <span>Value: {sensor.value}</span>
                  <span>Importance: {(sensor.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="importance-bar">
                  <div className="importance-fill" style={{width: `${sensor.importance * 100}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="explanation-text">
            <p>{explanation.explanation_text}</p>
          </div>

          <div className="recommendations">
            <h5>Recommended Actions:</h5>
            <ul>
              {Array.isArray(explanation.recommendations) && explanation.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {result.alerts && result.alerts.length > 0 && (
        <div className="alerts-section">
          <h4>⚠️ Triggered Alerts ({result.alerts.length})</h4>
          {result.alerts.map((alert, idx) => (
            <div key={idx} className={`alert-item ${alert.severity.toLowerCase()}`}>
              <span className="alert-severity">{alert.severity}</span>
              <span className="alert-message">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {result.recommendations && Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>💡 Maintenance Recommendations:</h4>
          <ul>
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;
