const { Sequelize } = require('sequelize');

//this file is just for testing the connection to the database
const sequelize = new Sequelize('postgres://task_user:taskpass@localhost:5432/task_tracker', {
  dialect: 'postgres',
  logging: false,
});


async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();