'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProvidersProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ProvidersProducts.init({
    idProvider: DataTypes.INTEGER,
    idProductProvider: DataTypes.STRING,
    values:  DataTypes.TEXT,
    idMainProduct: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'ProvidersProducts',
  });
  return ProvidersProducts;
};