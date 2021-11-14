'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Providers', [
      {
        nameProvider: 'YM',
        row: 5,
        tabName: 'Ассортимент',
        fieldsNames: JSON.stringify(['innerId', 'name', 'barcode']),
        fieldsSymbols: JSON.stringify(['C', 'D', 'I']),
        createdAt: '2021-11-10 07:26:03.623+03', // TODO: now()
        updatedAt: '2021-11-10 07:26:03.623+03'
      },
      {
        nameProvider: 'Ozon',
        row: 5,
        tabName: '',
        fieldsNames: JSON.stringify(['innerId', 'name', 'barcode']),
        fieldsSymbols: JSON.stringify(['B', 'F', 'E']),
        createdAt: '2021-11-10 07:26:03.623+03',
        updatedAt: '2021-11-10 07:26:03.623+03'
      },
      {
        nameProvider: '1C',
        row: 12,
        tabName: 'TDSheet',
        fieldsNames: JSON.stringify(['innerId', 'name', 'price']),
        fieldsSymbols: JSON.stringify(['C', 'B', 'D']),
        createdAt: '2021-11-10 07:26:03.623+03',
        updatedAt: '2021-11-10 07:26:03.623+03'
      },
      {
        nameProvider: 'markup',
        row: 2,
        tabName: 'Лист1',
        fieldsNames: JSON.stringify(['innerId', 'name', 'markup']),
        fieldsSymbols: JSON.stringify(['A', 'B', 'E']),
        createdAt: '2021-11-10 07:26:03.623+03',
        updatedAt: '2021-11-10 07:26:03.623+03'
      },

  ], {});
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Providers', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
