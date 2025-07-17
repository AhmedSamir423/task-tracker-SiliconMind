const sequelize = require('./database');
const User = require('./models/user');
const Task = require('./models/task');

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true }); // Drops and recreates all tables
    console.log('Database synchronized successfully: Users and Tasks tables created.');
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();