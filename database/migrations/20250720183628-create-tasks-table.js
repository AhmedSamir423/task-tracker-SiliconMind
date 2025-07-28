'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tasks', {
      task_id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      estimate: { type: Sequelize.INTEGER, allowNull: false },
      status: {
        type: Sequelize.ENUM('To do', 'In Progress', 'Done'),
        allowNull: false,
        defaultValue: 'To do',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      completed_at: { type: Sequelize.DATE },
      loggedtime: { type: Sequelize.INTEGER, defaultValue: 0 },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Tasks');
  },
};
