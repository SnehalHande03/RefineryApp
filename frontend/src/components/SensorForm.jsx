import React, { useState, useEffect } from 'react';
import { submitSensorReading, getMachines } from '../services/api';
import './SensorForm.css';

const SensorForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    machine_id: '',
    temperature: '',
    pressure: '',
    vibration: '',
    flow_rate: '',
    humidity: '',
  });

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMachines, setLoadingMachines] = useState(true);

  useEffect(() => {
    const loadMachines = async () => {
      try {
        const data = await getMachines();
        const machinesList = data.results || (Array.isArray(data) ? data : []);
        setMachines(machinesList);
        setLoadingMachines(false);
      } catch (err) {
        console.error('Error loading machines:', err);
        setMachines([]);
        setLoadingMachines(false);
      }
    };
    loadMachines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'machine_id') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.machine_id) {
        throw new Error('Machine ID is required');
      }
      if (!formData.temperature || !formData.pressure || !formData.vibration || !formData.flow_rate || formData.humidity === '') {
        throw new Error('All sensor values are required');
      }

      const result = await submitSensorReading(formData);
      onSubmit(result);

      setFormData({
        machine_id: formData.machine_id,
        temperature: '',
        pressure: '',
        vibration: '',
        flow_rate: '',
        humidity: '',
      });
    } catch (err) {
      setError(err.message || 'Error submitting sensor reading');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sensor-form-container">
      <h2>Submit Sensor Reading</h2>
      <p className="form-subtitle">Capture live machine telemetry for failure prediction.</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="sensor-form">
        <div className="form-row">
          <div className="form-group">
            <label>Machine ID *</label>
            {loadingMachines ? (
              <select disabled>
                <option>Loading machines...</option>
              </select>
            ) : machines.length === 0 ? (
              <select disabled>
                <option>No machines available</option>
              </select>
            ) : (
              <select name="machine_id" value={formData.machine_id} onChange={handleChange} required>
                <option value="">-- Select a machine --</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.machine_id}>
                    {machine.machine_id}
                  </option>
                ))}
              </select>
            )}
            <small>Select machine by ID</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Temperature (C) *</label>
            <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="10-150" step="0.1" min="10" max="150" />
            <small>Range: 10-150 C</small>
          </div>

          <div className="form-group">
            <label>Pressure (bar) *</label>
            <input type="number" name="pressure" value={formData.pressure} onChange={handleChange} placeholder="0-100" step="0.1" min="0" max="100" />
            <small>Range: 0-100 bar</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Vibration (mm/s) *</label>
            <input type="number" name="vibration" value={formData.vibration} onChange={handleChange} placeholder="0-50" step="0.01" min="0" max="50" />
            <small>Range: 0-50 mm/s</small>
          </div>

          <div className="form-group">
            <label>Flow Rate (L/min) *</label>
            <input type="number" name="flow_rate" value={formData.flow_rate} onChange={handleChange} placeholder="0-5000" step="1" min="0" max="5000" />
            <small>Range: 0-5000 L/min</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Humidity (%) *</label>
            <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="0-100" step="0.1" min="0" max="100" />
            <small>Range: 0-100%</small>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Submitting...' : 'Submit Reading'}
        </button>
      </form>
    </div>
  );
};

export default SensorForm;


