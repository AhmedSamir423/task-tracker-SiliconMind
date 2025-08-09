const express = require('express');
const dotenv = require('dotenv');
const models = require('../database/models'); // Re-add this import
const { logger, morganMiddleware } = require('./logger');
const routes = require('./routes');
const cors = require('cors');

dotenv.config({ path: '../root.env' });

models.sequelize
  .authenticate()
  .then(() => logger.info('Database connected'))
  .catch((err) => logger.error('Database connection failed:', err));
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Allow your frontend origin
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies/auth credentials if needed
  optionsSuccessStatus: 204, // Return 204 for OPTIONS preflight requests
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// HTTP request logging
app.use(morganMiddleware);

// Use the routes
app.use('/', routes);

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});