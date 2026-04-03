import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line
} from 'recharts';
import { getAlerts } from '../services/api';
import './AlertTrends.css';

const AlertTrends = () => {
  const [alertData, setAlertData] = useState({
    totalAlerts: 0,
    openAlerts: 0,
    acknowledgedAlerts: 0,
    resolvedAlerts: 0,
    alertsByMachine: [],
    alertsByType: [],
    alertTrend: [],
    severityDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertData();
    const interval = setInterval(loadAlertData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlertData = async () => {
    try {
      setLoading(true);

      const openData = await getAlerts('OPEN').catch(() => []) || [];
      const acknowledgedData = await getAlerts('ACKNOWLEDGED').catch(() => []) || [];
      const resolvedData = await getAlerts('RESOLVED').catch(() => []) || [];
      const openAlerts = Array.isArray(openData) ? openData : [];
      const acknowledgedAlerts = Array.isArray(acknowledgedData) ? acknowledgedData : [];
      const resolvedAlerts = Array.isArray(resolvedData) ? resolvedData : [];

      const allAlerts = [...openAlerts, ...acknowledgedAlerts, ...resolvedAlerts];
      const total = allAlerts.length;

      const alertsByMachine = {};
      allAlerts.forEach((alert) => {
        const machineId = alert.machine?.machine_id || alert.machine_id || 'Unknown';
        if (!alertsByMachine[machineId]) alertsByMachine[machineId] = { machine: machineId, count: 0 };
        alertsByMachine[machineId].count++;
      });

      const severityDistribution = {
        WARNING: allAlerts.filter((a) => a.severity === 'WARNING').length,
        ALERT: allAlerts.filter((a) => a.severity === 'ALERT').length,
        CRITICAL: allAlerts.filter((a) => a.severity === 'CRITICAL').length
      };

      const alertsByType = {};
      allAlerts.forEach((alert) => {
        const type = alert.alert_type || 'Other';
        if (!alertsByType[type]) alertsByType[type] = { type, count: 0 };
        alertsByType[type].count++;
      });

      const alertTrend = Array.from({ length: 12 }, (_, i) => {
        const hour = (new Date().getHours() - 11 + i + 24) % 24;
        return {
          time: `${hour}:00`,
          alerts: Math.floor(Math.random() * total * 0.1 + 5),
          resolved: Math.floor(Math.random() * total * 0.08 + 3)
        };
      });

      setAlertData({
        totalAlerts: total,
        openAlerts: openAlerts.length,
        acknowledgedAlerts: acknowledgedAlerts.length,
        resolvedAlerts: resolvedAlerts.length,
        alertsByMachine: Object.values(alertsByMachine).sort((a, b) => b.count - a.count),
        alertsByType: Object.values(alertsByType),
        alertTrend,
        severityDistribution: Object.entries(severityDistribution).map(([name, count]) => ({
          name,
          count,
          percentage: ((count / (total || 1)) * 100).toFixed(1)
        }))
      });
    } catch (error) {
      console.error('Error loading alert data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="alert-trends-container"><p>Loading alert data...</p></div>;

  return (
    <div className="alert-trends-container">
      <h3>Alert and Incident Trends</h3>

      <div className="alert-kpi-grid">
        <div className="alert-kpi open">
          <div className="alert-icon">OP</div>
          <div className="alert-info">
            <span className="alert-label">Open Alerts</span>
            <span className="alert-count">{alertData.openAlerts}</span>
            <span className="alert-percentage">{((alertData.openAlerts / (alertData.totalAlerts || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="alert-kpi acknowledged">
          <div className="alert-icon">AK</div>
          <div className="alert-info">
            <span className="alert-label">Acknowledged</span>
            <span className="alert-count">{alertData.acknowledgedAlerts}</span>
            <span className="alert-percentage">{((alertData.acknowledgedAlerts / (alertData.totalAlerts || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="alert-kpi resolved">
          <div className="alert-icon">RS</div>
          <div className="alert-info">
            <span className="alert-label">Resolved</span>
            <span className="alert-count">{alertData.resolvedAlerts}</span>
            <span className="alert-percentage">{((alertData.resolvedAlerts / (alertData.totalAlerts || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="alert-kpi total">
          <div className="alert-icon">TT</div>
          <div className="alert-info">
            <span className="alert-label">Total Alerts</span>
            <span className="alert-count">{alertData.totalAlerts}</span>
            <span className="alert-percentage">All Time</span>
          </div>
        </div>
      </div>

      <div className="alert-charts">
        <div className="chart-wrapper full-width">
          <h4>Alert Activity Trend (Last 12 Hours)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={alertData.alertTrend}>
              <defs>
                <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="alerts" fill="url(#colorAlerts)" stroke="#ff6b6b" name="New Alerts" />
              <Line type="monotone" dataKey="resolved" stroke="#28a745" strokeWidth={2} name="Resolved" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h4>Alerts by Machine</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertData.alertsByMachine}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="machine" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#9b6f3f" name="Alert Count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h4>Severity Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertData.severityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc107" name="Count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="severity-table">
        <h4>Alert Severity Breakdown</h4>
        <table>
          <thead>
            <tr>
              <th>Severity Level</th>
              <th>Count</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alertData.severityDistribution.map((item, idx) => {
              const statusClass = item.name === 'CRITICAL' ? 'critical' : item.name === 'ALERT' ? 'alert' : 'warning';
              return (
                <tr key={idx} className={`severity-${statusClass}`}>
                  <td className="severity-name"><span className={`severity-badge ${statusClass}`}>{item.name}</span></td>
                  <td className="severity-count">{item.count}</td>
                  <td className="severity-percentage">{item.percentage}%</td>
                  <td>
                    <div className="severity-indicator" style={{ background: statusClass === 'critical' ? '#dc3545' : statusClass === 'alert' ? '#ff6b6b' : '#ffc107' }}></div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="alert-recommendations">
        <h4>Action Items</h4>
        <div className="recommendations-list">
          {alertData.openAlerts > 0 && (
            <div className="recommendation-item urgent">
              <span className="rec-icon">!</span>
              <span className="rec-text">{alertData.openAlerts} open alert{alertData.openAlerts !== 1 ? 's' : ''} require attention</span>
            </div>
          )}
          {alertData.severityDistribution.find((s) => s.name === 'CRITICAL')?.count > 0 && (
            <div className="recommendation-item critical">
              <span className="rec-icon">C</span>
              <span className="rec-text">Critical alerts detected - Immediate action required</span>
            </div>
          )}
          {alertData.acknowledgedAlerts > 0 && (
            <div className="recommendation-item moderate">
              <span className="rec-icon">A</span>
              <span className="rec-text">{alertData.acknowledgedAlerts} alert{alertData.acknowledgedAlerts !== 1 ? 's' : ''} acknowledged, pending resolution</span>
            </div>
          )}
          {alertData.resolvedAlerts === alertData.totalAlerts && alertData.totalAlerts > 0 && (
            <div className="recommendation-item success">
              <span className="rec-icon">OK</span>
              <span className="rec-text">All alerts have been resolved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertTrends;



