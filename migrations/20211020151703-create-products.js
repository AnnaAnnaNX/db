'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code1C: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      rightName: {
        type: Sequelize.STRING
      },
      retailPrice: {
        type: Sequelize.INTEGER
      },
      purchasePrice: {
        type: Sequelize.INTEGER
      },
      supplierAgreementRatio: {
        type: Sequelize.FLOAT
      },
      quantityGoodsAtSupplier: {
        type: Sequelize.INTEGER
      },
      quantityGoodsAtOurStore: {
        type: Sequelize.INTEGER
      },
      skuYm: {
        type: Sequelize.STRING
      },
      linkToImage: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      categoryInOurShope: {
        type: Sequelize.STRING
      },
      brand: {
        type: Sequelize.STRING
      },
      barcode: {
        type: Sequelize.STRING
      },
      widthCm: {
        type: Sequelize.FLOAT
      },
      heightCm: {
        type: Sequelize.FLOAT
      },
      depthCm: {
        type: Sequelize.FLOAT
      },
      weightKg: {
        type: Sequelize.FLOAT
      },
      artOzon: {
        type: Sequelize.STRING
      },
      ndsOzon: {
        type: Sequelize.STRING
      },
      commTypeOzon: {
        type: Sequelize.STRING
      },
      modelName: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products');
  }
};