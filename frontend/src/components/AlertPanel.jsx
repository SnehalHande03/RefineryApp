import React, { useMemo, useState } from 'react';
import './AlertPanel.css';

const INITIAL_VISIBLE = 4;

const AlertPanel = ({ alerts, onAcknowledge, onResolve }) => {
  const alertsArray = Array.isArray(alerts) ? alerts : [];
  const [showHidden, setShowHidden] = useState(false);

  const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };

  const sortedAlerts = useMemo(() => {
    return [...alertsArray].sort((a, b) => {
      const sevDiff = (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.triggered_at) - new Date(a.triggered_at);
    });
  }, [alertsArray]);

  const visibleAlerts = sortedAlerts.slice(0, INITIAL_VISIBLE);
  const hiddenAlerts = sortedAlerts.slice(INITIAL_VISIBLE);
  const hiddenCount = hiddenAlerts.length;

  const groupBySeverity = (items) => ({
    CRITICAL: items.filter((a) => a.severity === 'CRITICAL'),
    WARNING: items.filter((a) => a.severity === 'WARNING'),
    INFO: items.filter((a) => a.severity === 'INFO'),
  });

  const groupedVisibleAlerts = groupBySeverity(visibleAlerts);
  const groupedHiddenAlerts = groupBySeverity(hiddenAlerts);

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
      <p className="alert-panel-hint">Showing latest 4 alerts. Remaining alerts are in a hidden section.</p>

      <div className="alerts-scroll-zone">
        {groupedVisibleAlerts.CRITICAL.length > 0 && (
          <div className="alert-group">
            <h4 className="group-title critical">Critical ({groupedVisibleAlerts.CRITICAL.length})</h4>
            {groupedVisibleAlerts.CRITICAL.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
          </div>
        )}

        {groupedVisibleAlerts.WARNING.length > 0 && (
          <div className="alert-group">
            <h4 className="group-title warning">Warning ({groupedVisibleAlerts.WARNING.length})</h4>
            {groupedVisibleAlerts.WARNING.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
          </div>
        )}

        {groupedVisibleAlerts.INFO.length > 0 && (
          <div className="alert-group">
            <h4 className="group-title info">Information ({groupedVisibleAlerts.INFO.length})</h4>
            {groupedVisibleAlerts.INFO.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
          </div>
        )}
      </div>

      {hiddenCount > 0 && (
        <div className="hidden-alerts-section">
          <button className="show-more-btn" onClick={() => setShowHidden((prev) => !prev)}>
            {showHidden ? 'Hide' : 'Show'} Hidden Alerts ({hiddenCount})
          </button>

          {showHidden && (
            <div className="hidden-alerts-content">
              {groupedHiddenAlerts.CRITICAL.length > 0 && (
                <div className="alert-group">
                  <h4 className="group-title critical">Critical ({groupedHiddenAlerts.CRITICAL.length})</h4>
                  {groupedHiddenAlerts.CRITICAL.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
                </div>
              )}

              {groupedHiddenAlerts.WARNING.length > 0 && (
                <div className="alert-group">
                  <h4 className="group-title warning">Warning ({groupedHiddenAlerts.WARNING.length})</h4>
                  {groupedHiddenAlerts.WARNING.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
                </div>
              )}

              {groupedHiddenAlerts.INFO.length > 0 && (
                <div className="alert-group">
                  <h4 className="group-title info">Information ({groupedHiddenAlerts.INFO.length})</h4>
                  {groupedHiddenAlerts.INFO.map((alert) => renderAlert(alert, onAcknowledge, onResolve))}
                </div>
              )}
            </div>
          )}
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


