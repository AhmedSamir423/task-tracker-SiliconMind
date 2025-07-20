const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database'); 

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false, // Disable createdAt and updatedAt
});
User.hasMany(Task, { foreignKey: 'user_id' });

module.exports = User;