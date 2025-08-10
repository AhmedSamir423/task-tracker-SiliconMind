const express = require('express');
const dotenv = require('dotenv');

// Load .env only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../root.env' });
}

// Validate and sanitize environment variables
const env = require('./config/env');

const models = require('./database/models');
const { logger, morganMiddleware } = require('./logger');
const routes = require('./routes');
const cors = require('cors');

// Test database connection (no sync needed - tables already exist)
models.sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connected successfully to existing local database');
  })
  .catch((err) => logger.error('Database connection failed:', err));

const app = express();

// CORS configuration
const corsOptions = {
  origin: env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:80', 'http://localhost'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morganMiddleware);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV 
  });
});

app.use('/', routes);

app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});