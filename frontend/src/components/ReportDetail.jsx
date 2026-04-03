import React, { useState } from 'react';
import './ReportDetail.css';

const ReportDetail = ({ report, onBack }) => {
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  if (!report) {
    return (
      <div className="report-detail-container">
        <div className="empty-state">
          <p>No report available</p>
          <button onClick={onBack}>Go Back</button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    alert(`Report download as ${downloadFormat.toUpperCase()} initiated`);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalReadings = report.total_readings || report.metrics?.total_readings || 0;
  const failureCount = report.failure_predictions || report.metrics?.failure_count || 0;
  const normalCount = totalReadings - failureCount;
  const failureRate =
    report.failure_rate !== undefined && report.failure_rate !== null
      ? Number(report.failure_rate).toFixed(1)
      : totalReadings > 0
        ? ((failureCount / totalReadings) * 100).toFixed(1)
        : '0.0';

  return (
    <div className="report-detail-container">
      <header className="report-header">
        <button className="back-button" onClick={onBack}>Back to Dashboard</button>
        <div className="report-title">
          <h1>Maintenance Report</h1>
          <p className="machine-id">{report.machine_name} | {report.machine_id}</p>
        </div>
        <div className="report-actions">
          <button className="action-button" onClick={handlePrint}>Print</button>
          <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button className="action-button primary" onClick={handleDownload}>Download</button>
        </div>
      </header>

      <main className="report-content">
        <section className="report-section executive-summary-section">
          <h2>Executive Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-icon">TR</div>
              <div className="card-content">
                <p className="card-label">Total Readings</p>
                <p className="card-value">{totalReadings}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">NO</div>
              <div className="card-content">
                <p className="card-label">Normal Operations</p>
                <p className="card-value">{normalCount}</p>
              </div>
            </div>
            <div className={`summary-card ${failureCount > 0 ? 'alert' : ''}`}>
              <div className="card-icon">FD</div>
              <div className="card-content">
                <p className="card-label">Failures Detected</p>
                <p className="card-value">{failureCount}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">FR</div>
              <div className="card-content">
                <p className="card-label">Failure Rate</p>
                <p className="card-value">{failureRate}%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="report-section">
          <h2>Average Sensor Values (Last 7 Days)</h2>
          {totalReadings === 0 ? (
            <div className="no-data-message">
              <p>No sensor readings found for this machine in the selected period.</p>
              <p>Submit sensor readings from the Monitor tab to see averages here.</p>
            </div>
          ) : (
            <div className="sensor-grid">
              <div className="sensor-card">
                <div className="sensor-header">Temperature</div>
                <div className="sensor-value">{(report.avg_temperature || 0).toFixed(1)} C</div>
                <div className="sensor-range">Normal: 20-90 C</div>
              </div>
              <div className="sensor-card">
                <div className="sensor-header">Pressure</div>
                <div className="sensor-value">{(report.avg_pressure || 0).toFixed(1)} bar</div>
                <div className="sensor-range">Normal: 0-80 bar</div>
              </div>
              <div className="sensor-card">
                <div className="sensor-header">Vibration</div>
                <div className="sensor-value">{(report.avg_vibration || 0).toFixed(2)} mm/s</div>
                <div className="sensor-range">Normal: less than 2.3 mm/s</div>
              </div>
              <div className="sensor-card">
                <div className="sensor-header">Flow Rate</div>
                <div className="sensor-value">{(report.avg_flow_rate || 0).toFixed(0)} L/min</div>
                <div className="sensor-range">Varies by equipment</div>
              </div>
              <div className="sensor-card">
                <div className="sensor-header">Humidity</div>
                <div className="sensor-value">{(report.avg_humidity || 0).toFixed(1)}%</div>
                <div className="sensor-range">Ambient monitor</div>
              </div>
            </div>
          )}
        </section>

        {report.recommendations && (
          <section className="report-section">
            <h2>Recommendations</h2>
            <div className="recommendations-list">
              {(Array.isArray(report.recommendations)
                ? report.recommendations
                : String(report.recommendations).split('\n').filter(Boolean)
              ).map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <span className="rec-number">{idx + 1}</span>
                  <div className="rec-content">
                    <p className="rec-text">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="report-section">
          <h2>Machine Health Status</h2>
          <div className="health-status">
            {failureCount === 0 ? (
              <div className="status-good">
                <h3>Equipment in Good Condition</h3>
                <p>No failure predictions detected in the last 7 days. Continue regular monitoring.</p>
              </div>
            ) : (
              <div className="status-warning">
                <h3>Maintenance Required</h3>
                <p>{failureCount} failure(s) predicted in the last 7 days. Schedule maintenance immediately.</p>
              </div>
            )}
          </div>
        </section>

        <section className="report-section footer-info">
          <p className="generated-time">Generated: {new Date().toLocaleString()}</p>
          <p className="report-period">Period: Last 7 Days</p>
        </section>
      </main>

      <footer className="report-footer">
        <button className="back-button large" onClick={onBack}>
          Return to Dashboard
        </button>
      </footer>
    </div>
  );
};

export default ReportDetail;


