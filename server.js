require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Initialize database table
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hello_messages (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database table initialized');
    
    // Insert a default message if table is empty
    const result = await pool.query('SELECT COUNT(*) FROM hello_messages');
    if (result.rows[0].count === '0') {
      await pool.query(
        'INSERT INTO hello_messages (message) VALUES ($1)',
        ['Hello, World!']
      );
      console.log('Default message inserted');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDatabase();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Hello World API is running!',
    endpoints: {
      '/': 'API status',
      '/hello': 'Get hello message',
      '/messages': 'Get all messages',
      '/health': 'Health check'
    }
  });
});

app.get('/hello', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hello_messages ORDER BY created_at DESC LIMIT 1'
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        message: result.rows[0].message,
        timestamp: result.rows[0].created_at
      });
    } else {
      res.json({ message: 'Hello, World!' });
    }
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hello_messages ORDER BY created_at DESC'
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/messages', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO hello_messages (message) VALUES ($1) RETURNING *',
      [message]
    );
    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Hello World API server running on port ${port}`);
  console.log(`Access it at http://localhost:${port}`);
});

