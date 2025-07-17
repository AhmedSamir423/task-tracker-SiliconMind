const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://task_user:taskpass@localhost:5432/task_tracker', {
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;