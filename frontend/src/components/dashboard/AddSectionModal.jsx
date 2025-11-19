import { useState } from 'react';
import api from '../../services/api';
import './AddSectionModal.css';

const AddSectionModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#4a90e2'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    '#4a90e2', '#50c878', '#e74c3c', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/sections', formData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Section</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Section Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Leg, Shoulder, Back, Chest, Cardio"
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-picker">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{ marginTop: '0.5rem', width: '100%', height: '40px' }}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSectionModal;

