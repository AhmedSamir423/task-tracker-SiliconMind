const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database'); 
const User = require('./user'); 

const Task = sequelize.define('Task', {
  task_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
  },
  estimate: {
    type: DataTypes.INTEGER, // Hours
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('To do', 'In Progress', 'Done'),
    allowNull: false,
    defaultValue: 'To do',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  completed_at: {
    type: DataTypes.DATE,
  },
  loggedtime: {
    type: DataTypes.INTEGER, // Hours
    defaultValue: 0,
  },
}, {
  timestamps: false, // Disable createdAt and updatedAt
});

// one-to-many relationship with User
User.hasMany(Task, { foreignKey: 'user_id' });
Task.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Task;