const express = require('express');
const dotenv = require('dotenv');
const models = require('../database/models'); // Re-add this import
const { logger, morganMiddleware } = require('./logger');
const routes = require('./routes');

models.sequelize
  .authenticate()
  .then(() => logger.info('Database connected'))
  .catch((err) => logger.error('Database connection failed:', err));
dotenv.config({ path: '../root.env' });
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use(morganMiddleware); // HTTP request logging

// Use the routes
app.use('/', routes);

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});