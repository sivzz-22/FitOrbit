import { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import './MetricsForm.css';

const getDefaultForm = () => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  calories: 2000,
  steps: 8000,
  waterIntake: 2.5,
  sleepHours: 7,
  notes: ''
});

const MetricsForm = ({ metric, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(getDefaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (metric) {
      setFormData({
        date: format(new Date(metric.date), 'yyyy-MM-dd'),
        calories: metric.calories ?? 0,
        steps: metric.steps ?? 0,
        waterIntake: metric.waterIntake ?? 0,
        sleepHours: metric.sleepHours ?? 0,
        notes: metric.notes || ''
      });
    } else {
      setFormData(getDefaultForm());
    }
  }, [metric]);

  const handleNumberChange = (e) => {
    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: isNaN(value) ? 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        calories: Number(formData.calories),
        steps: Number(formData.steps),
        waterIntake: Number(formData.waterIntake),
        sleepHours: Number(formData.sleepHours)
      };

      if (metric) {
        await api.put(`/metrics/${metric._id}`, payload);
      } else {
        await api.post('/metrics', payload);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="metrics-form card">
      <div className="metrics-form-header">
        <div>
          <p className="eyebrow-text">Daily Wellness Log</p>
          <h2>{metric ? 'Edit Daily Entry' : 'Add Daily Entry'}</h2>
        </div>
        <div className="form-date">
          <label htmlFor="date">Log Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="metrics-input-grid">
          <div className="input-card">
            <label htmlFor="calories">Calories Consumed</label>
            <div className="input-with-addon">
              <input
                type="number"
                id="calories"
                name="calories"
                min="0"
                value={formData.calories}
                onChange={handleNumberChange}
                required
              />
              <span>kcal</span>
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="steps">Steps</label>
            <div className="input-with-addon">
              <input
                type="number"
                id="steps"
                name="steps"
                min="0"
                value={formData.steps}
                onChange={handleNumberChange}
                required
              />
              <span>steps</span>
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="waterIntake">Water Intake</label>
            <div className="input-with-addon">
              <input
                type="number"
                id="waterIntake"
                name="waterIntake"
                min="0"
                step="0.1"
                value={formData.waterIntake}
                onChange={handleNumberChange}
                required
              />
              <span>liters</span>
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="sleepHours">Sleep Duration</label>
            <div className="input-with-addon">
              <input
                type="number"
                id="sleepHours"
                name="sleepHours"
                min="0"
                max="24"
                step="0.1"
                value={formData.sleepHours}
                onChange={handleNumberChange}
                required
              />
              <span>hours</span>
            </div>
          </div>
        </div>

        <div className="notes-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            placeholder="How did today feel? Any wins or struggles?"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : metric ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MetricsForm;
