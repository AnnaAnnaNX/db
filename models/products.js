'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Products.init({
    code1C: DataTypes.STRING,
    name: DataTypes.TEXT,
    rightName: DataTypes.STRING,
    retailPrice: DataTypes.INTEGER,
    purchasePrice: DataTypes.INTEGER,
    supplierAgreementRatio: DataTypes.FLOAT,
    quantityGoodsAtSupplier: DataTypes.INTEGER,
    quantityGoodsAtOurStore: DataTypes.INTEGER,
    skuYm: DataTypes.TEXT,
    linkToImage: DataTypes.TEXT,
    description: DataTypes.TEXT,
    categoryInOurShope: DataTypes.TEXT,
    brand: DataTypes.TEXT,
    barcode: DataTypes.TEXT,
    widthCm: DataTypes.FLOAT,
    heightCm: DataTypes.FLOAT,
    depthCm: DataTypes.FLOAT,
    weightKg: DataTypes.STRING,
    artOzon: DataTypes.STRING,
    ndsOzon: DataTypes.STRING,
    commTypeOzon: DataTypes.STRING,
    modelName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Products',
  });
  return Products;
};