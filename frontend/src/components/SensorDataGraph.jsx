import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { getSensorReadings } from '../services/api';
import './SensorDataGraph.css';

const SensorDataGraph = ({ machineId }) => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState({
    temperature: true,
    pressure: true,
    vibration: true,
    humidity: true
  });

  useEffect(() => {
    loadSensorData();
  }, [machineId]);

  const loadSensorData = async () => {
    try {
      setLoading(true);
      const data = await getSensorReadings(machineId);

      const readings = (data.results || data || [])
        .slice(-20)
        .map((reading) => ({
          time: new Date(reading.timestamp).toLocaleTimeString(),
          timestamp: reading.timestamp,
          temperature: reading.temperature,
          pressure: reading.pressure,
          vibration: (reading.vibration * 100).toFixed(2),
          humidity: reading.humidity,
          flowRate: reading.flow_rate,
          failure: reading.failure_predicted ? 'Risk' : 'Normal'
        }));

      setSensorData(readings);
    } catch (error) {
      console.error('Error loading sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMetric = (metric) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  if (loading) {
    return <div className="sensor-graph-container"><p>Loading sensor data...</p></div>;
  }

  if (sensorData.length === 0) {
    return <div className="sensor-graph-container"><p>No sensor data available</p></div>;
  }

  return (
    <div className="sensor-graph-container">
      <div className="graph-header">
        <h3>Real-time Sensor Data</h3>
        <div className="metric-toggles">
          <label className="metric-label">
            <input type="checkbox" checked={selectedMetrics.temperature} onChange={() => toggleMetric('temperature')} />
            <span className="temp-dot">Temperature</span>
          </label>
          <label className="metric-label">
            <input type="checkbox" checked={selectedMetrics.pressure} onChange={() => toggleMetric('pressure')} />
            <span className="pressure-dot">Pressure</span>
          </label>
          <label className="metric-label">
            <input type="checkbox" checked={selectedMetrics.vibration} onChange={() => toggleMetric('vibration')} />
            <span className="vibration-dot">Vibration</span>
          </label>
          <label className="metric-label">
            <input type="checkbox" checked={selectedMetrics.humidity} onChange={() => toggleMetric('humidity')} />
            <span className="humidity-dot">Humidity</span>
          </label>
        </div>
      </div>

      <div className="charts-grid">
        {selectedMetrics.temperature && (
          <div className="chart-wrapper">
            <h4>Temperature Trend (C)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff7300" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[60, 120]} />
                <Tooltip formatter={(value) => `${value} C`} />
                <Area type="monotone" dataKey="temperature" stroke="#ff7300" fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetrics.pressure && (
          <div className="chart-wrapper">
            <h4>Pressure Trend (bar)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b6f3f" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9b6f3f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[170, 260]} />
                <Tooltip formatter={(value) => `${value} bar`} />
                <Area type="monotone" dataKey="pressure" stroke="#9b6f3f" fillOpacity={1} fill="url(#colorPres)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetrics.vibration && (
          <div className="chart-wrapper">
            <h4>Vibration Trend (mm/s x 100)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => `${value} mm/s`} />
                <Line type="monotone" dataKey="vibration" stroke="#ff6b6b" strokeWidth={2} dot={{ fill: '#ff6b6b', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetrics.humidity && (
          <div className="chart-wrapper">
            <h4>Humidity Level (%)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b6f3f" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9b6f3f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[35, 55]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Area type="monotone" dataKey="humidity" stroke="#9b6f3f" fillOpacity={1} fill="url(#colorHum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetrics.temperature && selectedMetrics.pressure && (
          <div className="chart-wrapper full-width">
            <h4>Combined Sensor Analysis</h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" label={{ value: 'Temp (C)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Pressure (bar)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ff7300" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#9b6f3f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="sensor-stats">
        <div className="stat-card">
          <span className="stat-label">Avg Temperature</span>
          <span className="stat-value">{(sensorData.reduce((sum, d) => sum + d.temperature, 0) / sensorData.length).toFixed(1)} C</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Pressure</span>
          <span className="stat-value">{(sensorData.reduce((sum, d) => sum + d.pressure, 0) / sensorData.length).toFixed(1)} bar</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Max Vibration</span>
          <span className="stat-value">{Math.max(...sensorData.map((d) => parseFloat(d.vibration))).toFixed(2)} mm/s</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Humidity</span>
          <span className="stat-value">{(sensorData.reduce((sum, d) => sum + d.humidity, 0) / sensorData.length).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default SensorDataGraph;




