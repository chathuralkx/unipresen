const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'faculty_resource_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

console.log('Attempting to connect to database:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    console.log('Database:', connection.config.database);
    
    // Test a simple query
    await connection.execute('SELECT 1 as test');
    console.log('Database query test passed');
    
    connection.release();
  } catch (error) {
    console.error('Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(' Check your MySQL username and password in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(' Database does not exist. Create it first with: CREATE DATABASE faculty_resource_db;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(' MySQL server is not running. Start MySQL service.');
    }
  }
}

// Test connection on startup
testConnection();

// Export the pool for use in other files
module.exports = pool;