import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { getSensorReadings } from '../services/api';
import './PredictionAnalytics.css';

const PredictionAnalytics = ({ machineId }) => {
  const [predictionStats, setPredictionStats] = useState({
    totalPredictions: 0,
    normalCount: 0,
    failureCount: 0,
    avgConfidence: 0,
    predictionsByTime: [],
    confidenceDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictionStats();
  }, [machineId]);

  const loadPredictionStats = async () => {
    try {
      setLoading(true);
      const data = await getSensorReadings(machineId);
      const readings = data.results || data || [];

      // Calculate statistics
      const total = readings.length;
      const normal = readings.filter(r => !r.failure_predicted).length;
      const failure = readings.filter(r => r.failure_predicted).length;
      const avgConf = readings.reduce((sum, r) => sum + (r.failure_confidence || 0), 0) / (total || 1);

      // Group predictions by hour
      const predictionsByTime = {};
      readings.forEach(reading => {
        const time = new Date(reading.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        if (!predictionsByTime[time]) {
          predictionsByTime[time] = { time, normal: 0, failure: 0 };
        }
        if (reading.failure_predicted) {
          predictionsByTime[time].failure += 1;
        } else {
          predictionsByTime[time].normal += 1;
        }
      });

      // Confidence distribution buckets
      const confidenceRanges = {
        '0-20%': 0,
        '20-40%': 0,
        '40-60%': 0,
        '60-80%': 0,
        '80-100%': 0
      };

      readings.forEach(reading => {
        const conf = (reading.failure_confidence || 0) * 100;
        if (conf <= 20) confidenceRanges['0-20%']++;
        else if (conf <= 40) confidenceRanges['20-40%']++;
        else if (conf <= 60) confidenceRanges['40-60%']++;
        else if (conf <= 80) confidenceRanges['60-80%']++;
        else confidenceRanges['80-100%']++;
      });

      setPredictionStats({
        totalPredictions: total,
        normalCount: normal,
        failureCount: failure,
        avgConfidence: avgConf,
        predictionsByTime: Object.values(predictionsByTime).slice(-15), // Last 15 time points
        confidenceDistribution: Object.entries(confidenceRanges).map(([range, count]) => ({
          name: range,
          count,
          percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
        }))
      });
    } catch (error) {
      console.error('Error loading prediction stats:', error);
      setPredictionStats({
        totalPredictions: 0,
        normalCount: 0,
        failureCount: 0,
        avgConfidence: 0,
        predictionsByTime: [],
        confidenceDistribution: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="prediction-analytics-container"><p>Loading analytics...</p></div>;
  }

  const totalPredictions = predictionStats.totalPredictions || 0;
  const hasPredictionData = totalPredictions > 0;
  const normalPercentage = hasPredictionData
    ? ((predictionStats.normalCount / totalPredictions) * 100).toFixed(1)
    : '0.0';
  const failurePercentage = hasPredictionData
    ? ((predictionStats.failureCount / totalPredictions) * 100).toFixed(1)
    : '0.0';

  if (!hasPredictionData) {
    return (
      <div className="prediction-analytics-container">
        <h3>📈 Prediction Analytics</h3>
        <p>No prediction data available for this machine yet. Submit sensor readings to generate analytics.</p>
      </div>
    );
  }

  return (
    <div className="prediction-analytics-container">
      <h3>📈 Prediction Analytics</h3>

      {/* Top KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card normal">
          <div className="kpi-icon">✓</div>
          <div className="kpi-content">
            <span className="kpi-label">Normal Status</span>
            <span className="kpi-value">{predictionStats.normalCount}</span>
            <span className="kpi-percentage">{normalPercentage}%</span>
          </div>
        </div>

        <div className="kpi-card failure">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <span className="kpi-label">Failure Risk</span>
            <span className="kpi-value">{predictionStats.failureCount}</span>
            <span className="kpi-percentage">{failurePercentage}%</span>
          </div>
        </div>

        <div className="kpi-card confidence">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Confidence</span>
            <span className="kpi-value">{(predictionStats.avgConfidence * 100).toFixed(1)}%</span>
            <span className="kpi-percentage">Model Accuracy</span>
          </div>
        </div>

        <div className="kpi-card total">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <span className="kpi-label">Total Predictions</span>
            <span className="kpi-value">{predictionStats.totalPredictions}</span>
            <span className="kpi-percentage">This Session</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-charts">
        {/* Pie Chart - Prediction Distribution */}
        <div className="chart-wrapper">
          <h4>Prediction Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Normal', value: predictionStats.normalCount, fill: '#28a745' },
                  { name: 'Failure Risk', value: predictionStats.failureCount, fill: '#dc3545' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#28a745" />
                <Cell fill="#dc3545" />
              </Pie>
              <Tooltip formatter={(value) => `${value} predictions`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Predictions by Time */}
        <div className="chart-wrapper">
          <h4>Predictions Timeline</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictionStats.predictionsByTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="normal" fill="#28a745" name="Normal" />
              <Bar dataKey="failure" fill="#dc3545" name="Failure Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Distribution */}
        <div className="chart-wrapper full-width">
          <h4>Confidence Level Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictionStats.confidenceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Number of Predictions', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value} predictions`} />
              <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confidence Level Table */}
      <div className="confidence-table">
        <h4>Confidence Breakdown</h4>
        <table>
          <thead>
            <tr>
              <th>Confidence Range</th>
              <th>Count</th>
              <th>Percentage</th>
              <th>Visual</th>
            </tr>
          </thead>
          <tbody>
            {predictionStats.confidenceDistribution.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td className="count">{item.count}</td>
                <td className="percentage">{item.percentage}%</td>
                <td className="visual">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PredictionAnalytics;
