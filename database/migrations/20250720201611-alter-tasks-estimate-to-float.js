'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Tasks', 'estimate', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Tasks', 'estimate', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
