const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'musiclearn',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-05:00', // Bogotá (Colombia)
})

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected')
    conn.release()
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message)
    console.log('ℹ️  Running without MySQL — mock data mode active')
  })

module.exports = pool
