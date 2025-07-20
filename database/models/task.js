module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    task_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estimate: {
      type: DataTypes.FLOAT,
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
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    timestamps: false,
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Task;
};