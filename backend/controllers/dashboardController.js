const db = require('../config/database');

// Get dashboard statistics based on user role
exports.getDashboardStats = async (req, res) => {
  try {
    const { userId, role } = req.user;
    let stats = {};

    switch (role) {
      case 'student':
        stats = await getStudentStats(userId);
        break;
      case 'lecturer':
        stats = await getLecturerStats(userId);
        break;
      case 'office_staff':
        stats = await getOfficeStaffStats(userId);
        break;
      case 'admin':
        stats = await getAdminStats();
        break;
      default:
        return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Student Dashboard Stats
async function getStudentStats(userId) {
  const [myBookings] = await db.query(`
    SELECT COUNT(*) as total_bookings,
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_bookings
    FROM bookings WHERE user_id = ?
  `, [userId]);

  const [upcomingBookings] = await db.query(`
    SELECT b.*, r.name as resource_name, r.type as resource_type, r.location
    FROM bookings b
    JOIN resources r ON b.resource_id = r.resource_id
    WHERE b.user_id = ? AND b.start_time > NOW() AND b.status = 'approved'
    ORDER BY b.start_time LIMIT 5
  `, [userId]);

  const [availableResources] = await db.query(`
    SELECT COUNT(*) as total_available
    FROM resources 
    WHERE availability = TRUE
  `);

  return {
    totalBookings: myBookings[0].total_bookings || 0,
    pendingBookings: myBookings[0].pending_bookings || 0,
    approvedBookings: myBookings[0].approved_bookings || 0,
    upcomingBookings,
    availableResources: availableResources[0].total_available || 0
  };
}

// Lecturer Dashboard Stats
async function getLecturerStats(userId) {
  const [myBookings] = await db.query(`
    SELECT COUNT(*) as total_bookings,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_bookings
    FROM bookings WHERE user_id = ?
  `, [userId]);

  const [upcomingBookings] = await db.query(`
    SELECT b.*, r.name as resource_name, r.type as resource_type, r.location
    FROM bookings b
    JOIN resources r ON b.resource_id = r.resource_id
    WHERE b.user_id = ? AND b.start_time > NOW() AND b.status = 'approved'
    ORDER BY b.start_time LIMIT 5
  `, [userId]);

  return {
    totalBookings: myBookings[0].total_bookings || 0,
    approvedBookings: myBookings[0].approved_bookings || 0,
    upcomingBookings
  };
}

// Office Staff Dashboard Stats
async function getOfficeStaffStats(userId) {
  const [pendingApprovals] = await db.query(`
    SELECT b.*, r.name as resource_name, u.name as user_name
    FROM bookings b
    JOIN resources r ON b.resource_id = r.resource_id
    JOIN users u ON b.user_id = u.user_id
    WHERE b.status = 'pending'
    ORDER BY b.created_at DESC
    LIMIT 10
  `);

  const [bookingStats] = await db.query(`
    SELECT 
      COUNT(*) as total_bookings,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
    FROM bookings
  `);

  const [resourceUtilization] = await db.query(`
    SELECT r.name, r.type, COUNT(b.booking_id) as booking_count
    FROM resources r
    LEFT JOIN bookings b ON r.resource_id = b.resource_id
    WHERE b.status = 'approved' AND b.start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY r.resource_id
    ORDER BY booking_count DESC
    LIMIT 5
  `);

  return {
    pendingApprovals,
    bookingStats: bookingStats[0],
    resourceUtilization
  };
}

// Admin Dashboard Stats
async function getAdminStats() {
  const [systemOverview] = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM resources) as total_resources,
      (SELECT COUNT(*) FROM bookings) as total_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings
  `);

  const [usersByRole] = await db.query(`
    SELECT role, COUNT(*) as count
    FROM users
    GROUP BY role
  `);

  const [recentActivity] = await db.query(`
    SELECT b.*, r.name as resource_name, u.name as user_name
    FROM bookings b
    JOIN resources r ON b.resource_id = r.resource_id
    JOIN users u ON b.user_id = u.user_id
    ORDER BY b.created_at DESC
    LIMIT 10
  `);

  return {
    systemOverview: systemOverview[0],
    usersByRole,
    recentActivity
  };
}

// Get recent bookings
exports.getRecentBookings = async (req, res) => {
  try {
    const { userId, role } = req.user;
    let query;
    let params = [];

    if (role === 'admin' || role === 'office_staff') {
      query = `
        SELECT b.*, r.name as resource_name, u.name as user_name
        FROM bookings b
        JOIN resources r ON b.resource_id = r.resource_id
        JOIN users u ON b.user_id = u.user_id
        ORDER BY b.created_at DESC
        LIMIT 20
      `;
    } else {
      query = `
        SELECT b.*, r.name as resource_name
        FROM bookings b
        JOIN resources r ON b.resource_id = r.resource_id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT 10
      `;
      params = [userId];
    }

    const [bookings] = await db.query(query, params);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};