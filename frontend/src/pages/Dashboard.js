import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🎓 Faculty Resource Management</h1>
          <p className="welcome-text">Welcome back, {currentUser?.name}!</p>
          <span className="role-badge">{currentUser?.role}</span>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content Based on Role */}
      <div className="dashboard-content">
        {currentUser?.role === 'student' && (
          <StudentDashboard data={dashboardData} />
        )}
        {currentUser?.role === 'lecturer' && (
          <LecturerDashboard data={dashboardData} />
        )}
        {currentUser?.role === 'office_staff' && (
          <OfficeStaffDashboard data={dashboardData} />
        )}
        {currentUser?.role === 'admin' && (
          <AdminDashboard data={dashboardData} />
        )}
      </div>
    </div>
  );
};

// Student Dashboard Component
const StudentDashboard = ({ data }) => (
  <div className="role-dashboard">
    <h2>Student Dashboard</h2>
    
    <div className="stats-grid">
      <div className="stat-card blue">
        <div className="stat-icon">📋</div>
        <div className="stat-details">
          <h3>{data?.totalBookings || 0}</h3>
          <p>Total Bookings</p>
        </div>
      </div>
      
      <div className="stat-card orange">
        <div className="stat-icon">⏳</div>
        <div className="stat-details">
          <h3>{data?.pendingBookings || 0}</h3>
          <p>Pending Approvals</p>
        </div>
      </div>
      
      <div className="stat-card green">
        <div className="stat-icon">✅</div>
        <div className="stat-details">
          <h3>{data?.approvedBookings || 0}</h3>
          <p>Approved Bookings</p>
        </div>
      </div>
      
      <div className="stat-card purple">
        <div className="stat-icon">🏢</div>
        <div className="stat-details">
          <h3>{data?.availableResources || 0}</h3>
          <p>Available Resources</p>
        </div>
      </div>
    </div>

    <div className="upcoming-section">
      <h3>Upcoming Bookings</h3>
      {data?.upcomingBookings && data.upcomingBookings.length > 0 ? (
        <div className="bookings-list">
          {data.upcomingBookings.map((booking) => (
            <div key={booking.booking_id} className="booking-card">
              <h4>{booking.resource_name}</h4>
              <p><strong>Type:</strong> {booking.resource_type}</p>
              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Time:</strong> {new Date(booking.start_time).toLocaleString()}</p>
              <span className={`status-badge ${booking.status}`}>{booking.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No upcoming bookings</p>
      )}
    </div>
  </div>
);

// Lecturer Dashboard Component
const LecturerDashboard = ({ data }) => (
  <div className="role-dashboard">
    <h2>Lecturer Dashboard</h2>
    
    <div className="stats-grid">
      <div className="stat-card blue">
        <div className="stat-icon">📋</div>
        <div className="stat-details">
          <h3>{data?.totalBookings || 0}</h3>
          <p>Total Bookings</p>
        </div>
      </div>
      
      <div className="stat-card green">
        <div className="stat-icon">✅</div>
        <div className="stat-details">
          <h3>{data?.approvedBookings || 0}</h3>
          <p>Approved Bookings</p>
        </div>
      </div>
    </div>

    <div className="upcoming-section">
      <h3>Upcoming Bookings</h3>
      {data?.upcomingBookings && data.upcomingBookings.length > 0 ? (
        <div className="bookings-list">
          {data.upcomingBookings.map((booking) => (
            <div key={booking.booking_id} className="booking-card">
              <h4>{booking.resource_name}</h4>
              <p><strong>Type:</strong> {booking.resource_type}</p>
              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Time:</strong> {new Date(booking.start_time).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No upcoming bookings</p>
      )}
    </div>
  </div>
);

// Office Staff Dashboard Component
const OfficeStaffDashboard = ({ data }) => (
  <div className="role-dashboard">
    <h2>Office Staff Dashboard</h2>
    
    <div className="stats-grid">
      <div className="stat-card blue">
        <div className="stat-icon">📊</div>
        <div className="stat-details">
          <h3>{data?.bookingStats?.total_bookings || 0}</h3>
          <p>Total Bookings</p>
        </div>
      </div>
      
      <div className="stat-card orange">
        <div className="stat-icon">⏳</div>
        <div className="stat-details">
          <h3>{data?.bookingStats?.pending_count || 0}</h3>
          <p>Pending Approvals</p>
        </div>
      </div>
      
      <div className="stat-card green">
        <div className="stat-icon">✅</div>
        <div className="stat-details">
          <h3>{data?.bookingStats?.approved_count || 0}</h3>
          <p>Approved</p>
        </div>
      </div>
      
      <div className="stat-card red">
        <div className="stat-icon">❌</div>
        <div className="stat-details">
          <h3>{data?.bookingStats?.rejected_count || 0}</h3>
          <p>Rejected</p>
        </div>
      </div>
    </div>

    <div className="pending-approvals-section">
      <h3>Pending Approvals</h3>
      {data?.pendingApprovals && data.pendingApprovals.length > 0 ? (
        <div className="approvals-list">
          {data.pendingApprovals.map((booking) => (
            <div key={booking.booking_id} className="approval-card">
              <h4>{booking.resource_name}</h4>
              <p><strong>Requested by:</strong> {booking.user_name}</p>
              <p><strong>Time:</strong> {new Date(booking.start_time).toLocaleString()}</p>
              <div className="approval-actions">
                <button className="btn-approve">Approve</button>
                <button className="btn-reject">Reject</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No pending approvals</p>
      )}
    </div>
  </div>
);

// Admin Dashboard Component
const AdminDashboard = ({ data }) => (
  <div className="role-dashboard">
    <h2>Admin Dashboard</h2>
    
    <div className="stats-grid">
      <div className="stat-card blue">
        <div className="stat-icon">👥</div>
        <div className="stat-details">
          <h3>{data?.systemOverview?.total_users || 0}</h3>
          <p>Total Users</p>
        </div>
      </div>
      
      <div className="stat-card green">
        <div className="stat-icon">🏢</div>
        <div className="stat-details">
          <h3>{data?.systemOverview?.total_resources || 0}</h3>
          <p>Total Resources</p>
        </div>
      </div>
      
      <div className="stat-card purple">
        <div className="stat-icon">📋</div>
        <div className="stat-details">
          <h3>{data?.systemOverview?.total_bookings || 0}</h3>
          <p>Total Bookings</p>
        </div>
      </div>
      
      <div className="stat-card orange">
        <div className="stat-icon">⏳</div>
        <div className="stat-details">
          <h3>{data?.systemOverview?.pending_bookings || 0}</h3>
          <p>Pending Approvals</p>
        </div>
      </div>
    </div>

    <div className="users-by-role-section">
      <h3>Users by Role</h3>
      {data?.usersByRole && data.usersByRole.length > 0 ? (
        <div className="role-stats">
          {data.usersByRole.map((roleData) => (
            <div key={roleData.role} className="role-stat-item">
              <span className="role-name">{roleData.role}</span>
              <span className="role-count">{roleData.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No user data available</p>
      )}
    </div>

    <div className="recent-activity-section">
      <h3>Recent Activity</h3>
      {data?.recentActivity && data.recentActivity.length > 0 ? (
        <div className="activity-list">
          {data.recentActivity.map((activity) => (
            <div key={activity.booking_id} className="activity-item">
              <p><strong>{activity.user_name}</strong> booked <strong>{activity.resource_name}</strong></p>
              <span className="activity-time">{new Date(activity.created_at).toLocaleString()}</span>
              <span className={`status-badge ${activity.status}`}>{activity.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No recent activity</p>
      )}
    </div>
  </div>
);

export default Dashboard;