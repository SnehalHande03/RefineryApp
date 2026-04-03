import React, { useState, useEffect } from 'react';
import SensorForm from '../components/SensorForm';
import PredictionResult from '../components/PredictionResult';
import PredictionDetail from '../components/PredictionDetail';
import AlertPanel from '../components/AlertPanel';
import MaintenanceReport from '../components/MaintenanceReport';
import ReportDetail from '../components/ReportDetail';
import SensorDataGraph from '../components/SensorDataGraph';
import PredictionAnalytics from '../components/PredictionAnalytics';
import AlertTrends from '../components/AlertTrends';
import { getAlerts, acknowledgeAlert, resolveAlert, generateReport, getMachines } from '../services/api';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionDetail, setPredictionDetail] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [tab, setTab] = useState('monitor');
  const [reportDetail, setReportDetail] = useState(null);
  const [selectedMachineForGraphs, setSelectedMachineForGraphs] = useState(null);

  useEffect(() => {
    loadMachines();
    loadAlerts();
  }, []);

  const loadMachines = async () => {
    try {
      const data = await getMachines();
      const machinesList = data.results || (Array.isArray(data) ? data : []);
      setMachines(machinesList);
    } catch (error) {
      console.error('Error loading machines:', error);
      setMachines([]);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await getAlerts('OPEN');
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    }
  };

  const handleSensorSubmit = (result) => {
    setPredictionResult(result);
    setPredictionDetail(result);
    loadAlerts();
  };

  const handleBackFromPrediction = () => {
    setPredictionDetail(null);
    setTab('monitor');
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlert(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedMachine) {
      alert('Please select a machine');
      return;
    }

    setLoadingReport(true);
    try {
      const reportData = await generateReport(selectedMachine.machine_id);
      setReport(reportData);
      setReportDetail(reportData);
      setTab('reportDetail');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleBackFromReport = () => {
    setReportDetail(null);
    setTab('report');
  };

  if (predictionDetail) {
    return <PredictionDetail prediction={predictionDetail} onBack={handleBackFromPrediction} />;
  }

  if (reportDetail) {
    return <ReportDetail report={reportDetail} onBack={handleBackFromReport} />;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <button className={`nav-tab ${tab === 'monitor' ? 'active' : ''}`} onClick={() => setTab('monitor')}>
          Monitor
        </button>
        <button className={`nav-tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>
          Analytics
        </button>
        <button className={`nav-tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
          Alerts {Array.isArray(alerts) && alerts.length > 0 && <span className="badge">{alerts.length}</span>}
        </button>
        <button className={`nav-tab ${tab === 'trends' ? 'active' : ''}`} onClick={() => setTab('trends')}>
          Trends
        </button>
        <button className={`nav-tab ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}>
          Reports
        </button>
      </nav>

      <main className="dashboard-content">
        {tab === 'monitor' && (
          <div className="tab-content">
            <div className="monitor-section">
              <div className="sensor-section">
                <h2>Submit Sensor Reading</h2>
                <SensorForm onSubmit={handleSensorSubmit} />
              </div>

              {predictionResult && (
                <div className="result-section">
                  <h2>Prediction Result</h2>
                  <PredictionResult result={predictionResult} />
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="tab-content">
            <div className="analytics-section">
              <div className="machine-selector-inline">
                <label>Select Machine for Data:</label>
                <select
                  value={selectedMachineForGraphs?.id || ''}
                  onChange={(e) => {
                    const machine = machines.find((m) => m.id === parseInt(e.target.value));
                    setSelectedMachineForGraphs(machine);
                  }}
                >
                  <option value="">-- Choose a machine --</option>
                  {Array.isArray(machines) &&
                    machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.machine_id}{machine.name ? ` - ${machine.name}` : ''}
                      </option>
                    ))}
                </select>
                {selectedMachineForGraphs && (
                  <p className="selected-machine-note">
                    Selected: {selectedMachineForGraphs.machine_id}
                    {selectedMachineForGraphs.name ? ` - ${selectedMachineForGraphs.name}` : ''}
                  </p>
                )}
              </div>

              {selectedMachineForGraphs && (
                <>
                  <SensorDataGraph machineId={selectedMachineForGraphs.machine_id} />
                  <PredictionAnalytics machineId={selectedMachineForGraphs.machine_id} />
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'alerts' && (
          <div className="tab-content">
            <AlertPanel alerts={alerts} onAcknowledge={handleAcknowledgeAlert} onResolve={handleResolveAlert} />
          </div>
        )}

        {tab === 'trends' && (
          <div className="tab-content">
            <AlertTrends />
          </div>
        )}

        {tab === 'report' && (
          <div className="tab-content">
            <div className="report-section">
              <h2>Generate Maintenance Report</h2>

              <div className="machine-selector">
                <label>Select Machine:</label>
                <select
                  value={selectedMachine?.id || ''}
                  onChange={(e) => {
                    const machine = machines.find((m) => m.id === parseInt(e.target.value));
                    setSelectedMachine(machine);
                  }}
                >
                  <option value="">-- Choose a machine --</option>
                  {Array.isArray(machines) &&
                    machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.machine_id}{machine.name ? ` - ${machine.name}` : ''}
                      </option>
                    ))}
                </select>
                {selectedMachine && (
                  <p className="selected-machine-note">
                    Selected: {selectedMachine.machine_id}
                    {selectedMachine.name ? ` - ${selectedMachine.name}` : ''}
                  </p>
                )}
              </div>

              <button className="generate-button" onClick={handleGenerateReport} disabled={!selectedMachine || loadingReport}>
                {loadingReport ? 'Generating...' : 'Generate Report'}
              </button>

              {report && (
                <div className="report-preview">
                  <h3>Current Report Preview</h3>
                  <MaintenanceReport report={report} />
                  <button
                    className="view-full-button"
                    onClick={() => {
                      setReportDetail(report);
                      setTab('reportDetail');
                    }}
                  >
                    View Full Report ->
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>FlowGuard AI Predictive Maintenance v1.0 | Industrial Intelligence</p>
      </footer>
    </div>
  );
}

export default Dashboard;


