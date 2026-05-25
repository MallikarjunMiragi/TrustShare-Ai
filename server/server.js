const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);
const isDev = process.env.NODE_ENV !== 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isDev && origin.startsWith('http://localhost:')) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const mongoStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoStates[mongoose.connection.readyState] || 'unknown',
  });
});

app.use('/api', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    console.error('Retrying MongoDB connection in 10 seconds...');
    setTimeout(connectWithRetry, 10000);
  }
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectWithRetry();
});
