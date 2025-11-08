const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/comics', require('./routes/comics'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/history', require('./routes/history'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware (phải đặt sau routes)
app.use(notFound);
app.use(errorHandler);

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to MySQL database');
    connection.release();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

