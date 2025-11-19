import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AddSectionModal.css';
import './ManageSectionsModal.css';

const ManageSectionsModal = ({ sections = [], onClose, onSuccess }) => {
  const [editedSections, setEditedSections] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setEditedSections(sections.map(section => ({ ...section })));
  }, [sections]);

  const handleChange = (id, field, value) => {
    setEditedSections(prev =>
      prev.map(section =>
        section._id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const handleSave = async (section) => {
    try {
      setError('');
      setSavingId(section._id);
      await api.put(`/sections/${section._id}`, {
        name: section.name,
        color: section.color
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update section');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Delete this section? Workouts already using it will keep their tag but new ones cannot select it.')) {
      return;
    }
    try {
      setError('');
      setDeletingId(sectionId);
      await api.delete(`/sections/${sectionId}`);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete section');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manage-sections-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Sections</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {editedSections.length === 0 ? (
          <p className="helper-text">
            No custom sections yet. Create one using the Add Section button first.
          </p>
        ) : (
          <div className="section-list">
            {editedSections.map(section => (
              <div key={section._id} className="section-row">
                <div className="section-fields">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => handleChange(section._id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group color-field">
                    <label>Color</label>
                    <input
                      type="color"
                      value={section.color}
                      onChange={(e) => handleChange(section._id, 'color', e.target.value)}
                    />
                  </div>
                </div>
                <div className="section-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={savingId === section._id}
                    onClick={() => handleSave(section)}
                  >
                    {savingId === section._id ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === section._id}
                    onClick={() => handleDelete(section._id)}
                  >
                    {deletingId === section._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSectionsModal;

