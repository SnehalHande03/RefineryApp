import React, { useMemo, useState } from 'react';
import './AlertPanel.css';

const INITIAL_VISIBLE = 4;
const LOAD_STEP = 4;

const AlertPanel = ({ alerts, onAcknowledge, onResolve }) => {
  const alertsArray = Array.isArray(alerts) ? alerts : [];
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };

  const sortedAlerts = useMemo(() => {
    return [...alertsArray].sort((a, b) => {
      const sevDiff = (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.triggered_at) - new Date(a.triggered_at);
    });
  }, [alertsArray]);

  const visibleAlerts = sortedAlerts.slice(0, visibleCount);
  const hiddenCount = Math.max(0, sortedAlerts.length - visibleAlerts.length);

  const groupedAlerts = {
    CRITICAL: visibleAlerts.filter((a) => a.severity === 'CRITICAL'),
    WARNING: visibleAlerts.filter((a) => a.severity === 'WARNING'),
    INFO: visibleAlerts.filter((a) => a.severity === 'INFO'),
  };

  const handleScroll = (e) => {
    if (hiddenCount === 0) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 48;
    if (nearBottom) {
      setVisibleCount((prev) => Math.min(prev + LOAD_STEP, sortedAlerts.length));
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_STEP, sortedAlerts.length));
  };

  if (alertsArray.length === 0) {
    return (
      <div className="alert-panel">
        <h3>Active Alerts</h3>
        <p className="no-alerts">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="alert-panel">
      <h3>Active Alerts ({alertsArray.length})</h3>
      <p className="alert-panel-hint">Showing latest high-priority 4 alerts first. Scroll to load more.</p>

      <div className="alerts-scroll-zone" onScroll={handleScroll}>
        {groupedAlerts.CRITICAL.length > 0 && (
          <div className="alert-group">
            <h4 className="group-title critical">Critical ({groupedAlerts.CRITICAL.length})</h4>
            {groupedAlerts.CRITICAL.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
          </div>
        )}

        {groupedAlerts.WARNING.length > 0 && (
          <div className="alert-group">
            <h4 className="group-title warning">Warning ({groupedAlerts.WARNING.length})</h4>
            {groupedAlerts.WARNING.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
          </div>
        )}

        {groupedAlerts.INFO.length > 0 && (
          <div className="alert-group">
            <h4 className="group-title info">Information ({groupedAlerts.INFO.length})</h4>
            {groupedAlerts.INFO.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
          </div>
        )}
      </div>

      {hiddenCount > 0 && (
        <div className="alerts-more-row">
          <span>{hiddenCount} more alerts hidden</span>
          <button className="show-more-btn" onClick={handleShowMore}>
            Show 4 More
          </button>
        </div>
      )}
    </div>
  );
};

const renderAlert = (alert, onAcknowledge, onResolve) => {
  const machineId = alert.machine_id || alert.machine?.machine_id || 'Unknown';

  return (
    <div key={alert.id} className={`alert-item ${String(alert.severity || '').toLowerCase()}`}>
    <div className="alert-header">
      <div className="alert-title">
        <span className="alert-type">{alert.alert_type}</span>
        <span className="alert-machine">Machine: {machineId}</span>
      </div>
      <div className="alert-time">{new Date(alert.triggered_at).toLocaleTimeString()}</div>
    </div>

    <div className="alert-message">{alert.title}</div>
    <div className="alert-description">{alert.description}</div>

    {alert.recommended_action && (
      <div className="alert-recommendation">
        <strong>Action:</strong> {alert.recommended_action}
      </div>
    )}

    <div className="alert-status">
      <span className={`status-badge ${String(alert.status || '').toLowerCase()}`}>{alert.status}</span>
    </div>

    <div className="alert-actions">
      {alert.status === 'OPEN' && (
        <>
          <button className="action-btn acknowledge" onClick={() => onAcknowledge && onAcknowledge(alert.id)}>
            Acknowledge
          </button>
          <button className="action-btn resolve" onClick={() => onResolve && onResolve(alert.id)}>
            Resolve
          </button>
        </>
      )}
      {alert.status === 'ACKNOWLEDGED' && (
        <button className="action-btn resolve" onClick={() => onResolve && onResolve(alert.id)}>
          Resolve
        </button>
      )}
    </div>
  </div>
  );
};

export default AlertPanel;
