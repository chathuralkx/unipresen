import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceAPI } from '../services/api';
import './Resources.css';

const Resources = () => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [filter, setFilter] = useState({ type: '', availability: '' });
  const [formData, setFormData] = useState({
    name: '',
    type: 'lab',
    location: '',
    capacity: '',
    description: '',
    department_id: '1',
    availability: true
  });

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'office_staff';

  useEffect(() => {
    fetchResources();
  }, [filter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getAll();
      let filtered = response.data;

      if (filter.type) {
        filtered = filtered.filter(r => r.type === filter.type);
      }
      if (filter.availability !== '') {
        filtered = filtered.filter(r => r.availability === (filter.availability === 'true'));
      }

      setResources(filtered);
    } catch (error) {
      console.error('Fetch resources error:', error);
      alert('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await resourceAPI.update(editingResource.resource_id, formData);
        alert('Resource updated successfully!');
      } else {
        await resourceAPI.create(formData);
        alert('Resource created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchResources();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.message || 'Failed to save resource');
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      location: resource.location,
      capacity: resource.capacity || '',
      description: resource.description || '',
      department_id: resource.department_id || '1',
      availability: resource.availability
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await resourceAPI.delete(id);
      alert('Resource deleted successfully!');
      fetchResources();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'lab',
      location: '',
      capacity: '',
      description: '',
      department_id: '1',
      availability: true
    });
    setEditingResource(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Loading resources...</div>;
  }

  return (
    <div className="resources-page">
      <div className="resources-header">
        <div>
          <h1>Resources Management</h1>
          <p>View and manage university resources</p>
        </div>
        {canManage && (
          <button 
            className="btn-primary" 
            onClick={() => setShowModal(true)}
          >
            + Add New Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select 
          value={filter.type} 
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="lab">Laboratory</option>
          <option value="lecture_hall">Lecture Hall</option>
          <option value="equipment">Equipment</option>
          <option value="venue">Venue</option>
        </select>

        <select 
          value={filter.availability} 
          onChange={(e) => setFilter({ ...filter, availability: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {resources.length === 0 ? (
          <div className="no-resources">
            <p>No resources found</p>
          </div>
        ) : (
          resources.map((resource) => (
            <div key={resource.resource_id} className="resource-card">
              <div className="resource-header">
                <h3>{resource.name}</h3>
                <span className={`type-badge ${resource.type}`}>
                  {resource.type.replace('_', ' ')}
                </span>
              </div>
              
              <div className="resource-details">
                <p><strong>📍 Location:</strong> {resource.location}</p>
                {resource.capacity && (
                  <p><strong>👥 Capacity:</strong> {resource.capacity}</p>
                )}
                <p><strong>🏢 Department:</strong> {resource.department_name || 'N/A'}</p>
                {resource.description && (
                  <p><strong>📝 Description:</strong> {resource.description}</p>
                )}
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status ${resource.availability ? 'available' : 'unavailable'}`}>
                    {resource.availability ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </p>
              </div>

              {canManage && (
                <div className="resource-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(resource)}
                  >
                    Edit
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(resource.resource_id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="resource-form">
              <div className="form-group">
                <label>Resource Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Computer Lab 1"
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="lab">Laboratory</option>
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="equipment">Equipment</option>
                  <option value="venue">Venue</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g., Building A - Floor 2"
                />
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                >
                  <option value="1">Computer Science</option>
                  <option value="2">Engineering</option>
                  <option value="3">Mathematics</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Brief description of the resource"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                  />
                  Available for booking
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingResource ? 'Update' : 'Create'} Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;