import { useState, useEffect } from 'react';
import api from '../../services/api';
import MetricsForm from './MetricsForm';
import MetricsCharts from './MetricsCharts';
import Loading from '../common/Loading';
import './MetricsPage.css';

const MetricsPage = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [editingMetric, setEditingMetric] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/metrics/history?days=${dateRange}`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setEditingMetric(null);
    fetchMetrics();
  };

  const handleEdit = (metric) => {
    setEditingMetric(metric);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this metrics entry?')) {
      try {
        await api.delete(`/metrics/${id}`);
        fetchMetrics();
      } catch (error) {
        console.error('Error deleting metrics:', error);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="metrics-page">
      <div className="metrics-page-header">
        <div>
          <h1>Daily Wellness Metrics</h1>
          <p className="metrics-subtitle">Log calories, movement, hydration, and sleep to stay consistent.</p>
        </div>
        <div className="date-range-selector">
          <label>View last: </label>
          <select value={dateRange} onChange={(e) => setDateRange(parseInt(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      <MetricsForm
        metric={editingMetric}
        onSuccess={handleFormSuccess}
        onCancel={() => setEditingMetric(null)}
      />

      <MetricsCharts
        metrics={metrics}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MetricsPage;
