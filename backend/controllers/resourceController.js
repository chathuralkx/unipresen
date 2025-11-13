const db = require('../config/database');

// Get all resources
exports.getAllResources = async (req, res) => {
  try {
    const { type, availability } = req.query;
    
    let query = `
      SELECT r.*, d.name as department_name 
      FROM resources r
      LEFT JOIN departments d ON r.department_id = d.department_id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND r.type = ?';
      params.push(type);
    }

    if (availability !== undefined) {
      query += ' AND r.availability = ?';
      params.push(availability === 'true' ? 1 : 0);
    }

    query += ' ORDER BY r.created_at DESC';

    const [resources] = await db.query(query, params);
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [resources] = await db.query(`
      SELECT r.*, d.name as department_name 
      FROM resources r
      LEFT JOIN departments d ON r.department_id = d.department_id
      WHERE r.resource_id = ?
    `, [id]);

    if (resources.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resources[0]);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new resource
exports.createResource = async (req, res) => {
  try {
    const { name, type, location, capacity, description, department_id } = req.body;
    const { role } = req.user;

    // Only admin and office_staff can create resources
    if (role !== 'admin' && role !== 'office_staff') {
      return res.status(403).json({ message: 'Not authorized to create resources' });
    }

    // Validation
    if (!name || !type || !location) {
      return res.status(400).json({ message: 'Please provide name, type, and location' });
    }

    const [result] = await db.query(
      `INSERT INTO resources (name, type, location, capacity, description, department_id, availability) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [name, type, location, capacity || null, description || null, department_id || null]
    );

    console.log(`✅ Resource created: ${name} (ID: ${result.insertId})`);

    res.status(201).json({
      message: 'Resource created successfully',
      resourceId: result.insertId
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, location, capacity, description, department_id, availability } = req.body;
    const { role } = req.user;

    // Only admin and office_staff can update resources
    if (role !== 'admin' && role !== 'office_staff') {
      return res.status(403).json({ message: 'Not authorized to update resources' });
    }

    // Check if resource exists
    const [existing] = await db.query('SELECT * FROM resources WHERE resource_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const [result] = await db.query(
      `UPDATE resources 
       SET name = ?, type = ?, location = ?, capacity = ?, description = ?, 
           department_id = ?, availability = ?
       WHERE resource_id = ?`,
      [name, type, location, capacity, description, department_id, availability, id]
    );

    console.log(`✅ Resource updated: ${name} (ID: ${id})`);

    res.json({ message: 'Resource updated successfully' });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Only admin can delete resources
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete resources' });
    }

    // Check if resource exists
    const [existing] = await db.query('SELECT * FROM resources WHERE resource_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if resource has bookings
    const [bookings] = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE resource_id = ? AND status = "approved"',
      [id]
    );

    if (bookings[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete resource with active bookings. Please cancel bookings first.' 
      });
    }

    await db.query('DELETE FROM resources WHERE resource_id = ?', [id]);

    console.log(`✅ Resource deleted: ID ${id}`);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get resource types (for dropdown)
exports.getResourceTypes = async (req, res) => {
  try {
    res.json([
      { value: 'lab', label: 'Laboratory' },
      { value: 'lecture_hall', label: 'Lecture Hall' },
      { value: 'equipment', label: 'Equipment' },
      { value: 'venue', label: 'Venue' }
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};