import React from 'react';
import './MaintenanceReport.css';

const MaintenanceReport = ({ report }) => {
  if (!report) {
    return (
      <div className="report-container">
        <p>No report available. Generate a report to see statistics.</p>
      </div>
    );
  }

  const priorityColor = {
    LOW: '#4caf50',
    MEDIUM: '#ff9800',
    HIGH: '#f57c00',
    CRITICAL: '#d32f2f',
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>{report.machine_id} - Maintenance Report</h2>
        <div className="date-range">
          {report.start_date} to {report.end_date}
        </div>
      </div>

      <div className="priority-section" style={{borderLeftColor: priorityColor[report.maintenance_priority]}}>
        <h3>Priority Level</h3>
        <div className="priority-badge" style={{backgroundColor: priorityColor[report.maintenance_priority]}}>
          {report.maintenance_priority}
        </div>
        <p className="priority-text">
          {getPriorityMessage(report.maintenance_priority)}
        </p>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Total Readings"
          value={report.total_readings}
          icon="TR"
        />
        <MetricCard
          label="Failure Predictions"
          value={report.failure_predictions}
          icon="FR"
        />
        <MetricCard
          label="Failure Rate"
          value={Math.round(report.failure_rate * 10) / 10 + '%'}
          icon="RT"
        />
        <MetricCard
          label="Alerts Triggered"
          value={report.alerts_triggered}
          icon="AL"
        />
        <MetricCard
          label="Critical Alerts"
          value={report.critical_alerts}
          icon="CR"
        />
      </div>

      <div className="sensor-averages">
        <h3>Average Sensor Values</h3>
        <div className="averages-grid">
          <SensorAverage
            sensor="Temperature"
            value={report.avg_temperature}
            unit=" C"
            range={[10, 150]}
          />
          <SensorAverage
            sensor="Pressure"
            value={report.avg_pressure}
            unit="bar"
            range={[0, 100]}
          />
          <SensorAverage
            sensor="Vibration"
            value={report.avg_vibration}
            unit="mm/s"
            range={[0, 50]}
          />
          <SensorAverage
            sensor="Flow Rate"
            value={report.avg_flow_rate}
            unit="L/min"
            range={[0, 5000]}
          />
          <SensorAverage
            sensor="Humidity"
            value={report.avg_humidity}
            unit="%"
            range={[0, 100]}
          />
        </div>
      </div>

      {report.recommendations && (
        <div className="recommendations">
          <h3>Maintenance Recommendations</h3>
          <div className="recommendations-text">
            {report.recommendations.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon }) => (
  <div className="metric-card">
    <span className="metric-icon">{icon}</span>
    <div className="metric-content">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  </div>
);

const SensorAverage = ({ sensor, value, unit, range }) => {
  const numValue = typeof value === 'number' ? value : (parseFloat(value) || 0);
  const percentage = ((numValue - range[0]) / (range[1] - range[0])) * 100;

  return (
    <div className="sensor-average">
      <div className="sensor-header">
        <span className="sensor-name">{sensor}</span>
        <span className="sensor-value">{(numValue || 0).toFixed(1)}{unit}</span>
      </div>
      <div className="sensor-range-bar">
        <div className="range-background"></div>
        <div className="range-fill" style={{width: `${Math.min(100, Math.max(0, percentage))}%`}}></div>
      </div>
      <div className="range-labels">
        <span className="range-min">{range[0]}{unit}</span>
        <span className="range-max">{range[1]}{unit}</span>
      </div>
    </div>
  );
};

const getPriorityMessage = (priority) => {
  const messages = {
    LOW: 'Machine operating normally. Continue routine monitoring.',
    MEDIUM: 'Some issues detected. Plan maintenance within the week.',
    HIGH: 'Significant issues detected. Plan maintenance within 48 hours.',
    CRITICAL: 'URGENT: Immediate maintenance required. High failure risk.',
  };
  return messages[priority] || '';
};

export default MaintenanceReport;


