import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const normalizeListResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
};

// ==================== SENSOR READINGS ====================

/**
 * Submit sensor reading and get prediction
 * @param {Object} data - {machine_id, temperature, pressure, vibration, flow_rate, humidity}
 * @returns {Object} - prediction result with failure_predicted, confidence, alerts, recommendations
 */
export const submitSensorReading = async (data) => {
  try {
    const response = await apiClient.post('/sensor-readings/', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to submit sensor reading' };
  }
};

/**
 * Get historical sensor readings for a machine
 * @param {String} machineId - machine identifier
 * @param {Number} page - pagination page (default 1)
 * @returns {Object} - paginated list of readings
 */
export const getSensorReadings = async (machineId, page = 1) => {
  try {
    const response = await apiClient.get('/sensor-readings/', {
      params: { machine_id: machineId, page: page },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch sensor readings' };
  }
};

// ==================== MACHINES ====================

/**
 * Get all machines
 * @returns {Array} - list of machines
 */
export const getMachines = async () => {
  try {
    const response = await apiClient.get('/machines/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch machines' };
  }
};

/**
 * Get a specific machine
 * @param {Number} machineId - database ID
 * @returns {Object} - machine details
 */
export const getMachine = async (machineId) => {
  try {
    const response = await apiClient.get(`/machines/${machineId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch machine' };
  }
};

/**
 * Create a new machine
 * @param {Object} data - {machine_id, name, machine_type, location}
 * @returns {Object} - created machine
 */
export const createMachine = async (data) => {
  try {
    const response = await apiClient.post('/machines/', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create machine' };
  }
};

// ==================== ALERTS ====================

/**
 * Get alerts with optional filters
 * @param {String} status - 'OPEN', 'ACKNOWLEDGED', 'RESOLVED' (optional)
 * @param {String} machineId - filter by machine (optional)
 * @returns {Array} - list of alerts
 */
export const getAlerts = async (status = null, machineId = null) => {
  try {
    const params = {};
    if (status) params.status = status;
    if (machineId) params.machine_id = machineId;

    const response = await apiClient.get('/alerts/', { params });
    return normalizeListResponse(response.data);
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch alerts' };
  }
};

/**
 * Acknowledge an alert (mark as seen)
 * @param {Number} alertId - alert ID
 * @returns {Object} - response
 */
export const acknowledgeAlert = async (alertId) => {
  try {
    const response = await apiClient.post(`/alerts/${alertId}/acknowledge/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to acknowledge alert' };
  }
};

/**
 * Resolve an alert (mark as fixed)
 * @param {Number} alertId - alert ID
 * @returns {Object} - response
 */
export const resolveAlert = async (alertId) => {
  try {
    const response = await apiClient.post(`/alerts/${alertId}/resolve/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to resolve alert' };
  }
};

// ==================== PREDICTIONS ====================

/**
 * Get explanation for a prediction
 * Explains which sensors contributed most to the prediction
 * @param {Number} sensorReadingId - sensor reading ID
 * @returns {Object} - {top_sensors, explanation_text, recommendations}
 */
export const getPredictionExplanation = async (sensorReadingId) => {
  try {
    const response = await apiClient.get(`/predictions/${sensorReadingId}/explain/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch explanation' };
  }
};

// ==================== REPORTS ====================

/**
 * Generate maintenance report for a machine
 * @param {String} machineId - machine identifier
 * @param {Number} daysBack - days to analyze (default 7)
 * @returns {Object} - report with statistics and recommendations
 */
export const generateReport = async (machineId, daysBack = 7) => {
  try {
    const response = await apiClient.post('/reports/generate/', {
      machine_id: machineId,
      days_back: daysBack,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate report' };
  }
};

/**
 * Get latest report for a machine
 * @param {String} machineId - machine identifier
 * @returns {Object} - latest report
 */
export const getLatestReport = async (machineId) => {
  try {
    const response = await apiClient.get('/reports/latest/', {
      params: { machine_id: machineId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch report' };
  }
};

export default apiClient;
