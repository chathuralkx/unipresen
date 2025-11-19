import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    registration_number: '',
    nic: '',
    academic_year: '',
    photo_url: '',
    address: '',
    contact_number: '',
    birthday: '',
    religion: '',
    district: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to load profile');
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
        return;
      }
      setProfile(data.user);
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('http://localhost:5000/api/auth/me/upload-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Photo upload failed');
        return;
      }

      setProfile(data.user);
      setSuccess('Photo uploaded successfully');
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        name: profile.name,
        email: profile.email,
        registration_number: profile.registration_number,
        nic: profile.nic,
        academic_year: profile.academic_year,
        address: profile.address,
        contact_number: profile.contact_number,
        birthday: profile.birthday,
        religion: profile.religion,
        district: profile.district
      };
      if (password && password.trim() !== '') body.password = password;

      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Update failed');
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
        return;
      }
      setProfile(data.user);
      setPassword('');
      setEditMode(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setPassword('');
    setError('');
    setSuccess('');
    fetchProfile();
  };

  if (loading) return <div style={{ padding: 20 }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: 20 }}>
      <h1>Student Dashboard</h1>

      {error && <div style={{ backgroundColor: '#ffe6e6', color: '#9b1b1b', padding: 12, marginBottom: 12, borderRadius: 4 }}>{error}</div>}
      {success && <div style={{ backgroundColor: '#e6ffe6', color: '#0a7a17', padding: 12, marginBottom: 12, borderRadius: 4 }}>{success}</div>}

      {!editMode ? (
        // View Mode
        <div style={{ backgroundColor: '#f9f9f9', padding: 20, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>Profile Information</h2>
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2d6cdf',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Photo Section */}
            <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              {profile.photo_url ? (
                <img
                  src={`http://localhost:5000${profile.photo_url}`}
                  alt="Student"
                  style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 150, height: 150, backgroundColor: '#ddd', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Photo
                </div>
              )}
            </div>

            {/* Info Fields */}
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Full Name</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.name || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Email</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.email || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Registration Number</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.registration_number || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>NIC</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.nic || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Academic Year</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.academic_year || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Contact Number</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.contact_number || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Birthday</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.birthday || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Religion</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.religion || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>District</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.district || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Address</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.address || 'N/A'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Role</label>
              <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>{profile.role || 'N/A'}</p>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div style={{ backgroundColor: '#f9f9f9', padding: 20, borderRadius: 8 }}>
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            {/* Photo Upload */}
            <div>
              <label style={{ fontWeight: 'bold' }}>Profile Photo</label>
              <div style={{ marginTop: 8, marginBottom: 12 }}>
                {profile.photo_url && (
                  <img
                    src={`http://localhost:5000${profile.photo_url}`}
                    alt="Current"
                    style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }}
                  />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
              {uploadingPhoto && <p style={{ fontSize: 12, color: '#666' }}>Uploading...</p>}
            </div>

            <label>
              Full Name
              <input
                name="name"
                value={profile.name || ''}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={profile.email || ''}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <label>
              Registration Number
              <input
                name="registration_number"
                value={profile.registration_number || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <label>
              NIC
              <input
                name="nic"
                value={profile.nic || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <label>
              Academic Year
              <input
                name="academic_year"
                value={profile.academic_year || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <label>
              Contact Number
              <input
                name="contact_number"
                value={profile.contact_number || ''}
                onChange={handleChange}
                placeholder="+94xxxxxxxxx"
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <label>
              Birthday
              <input
                name="birthday"
                type="date"
                value={profile.birthday || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <label>
              Religion
              <select
                name="religion"
                value={profile.religion || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              >
                <option value="">Select Religion</option>
                <option value="Buddhism">Buddhism</option>
                <option value="Hinduism">Hinduism</option>
                <option value="Islam">Islam</option>
                <option value="Christianity">Christianity</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              District
              <select
                name="district"
                value={profile.district || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              >
                <option value="">Select District</option>
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Kandy">Kandy</option>
                <option value="Matara">Matara</option>
                <option value="Galle">Galle</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Batticaloa">Batticaloa</option>
                <option value="Kurunegala">Kurunegala</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Address
              <textarea
                name="address"
                value={profile.address || ''}
                onChange={handleChange}
                placeholder="Enter your address"
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box', minHeight: 80 }}
              />
            </label>

            <label>
              Password (leave blank to keep current)
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                style={{ width: '100%', padding: 8, marginTop: 6, boxSizing: 'border-box' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#2d6cdf',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#999',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;