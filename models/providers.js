'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Providers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Providers.init({
    nameProvider: DataTypes.STRING,
    row: DataTypes.INTEGER,
    tabName: DataTypes.STRING,
    columnInnerId: DataTypes.STRING,
    columnName: DataTypes.STRING,
    columnPrice: DataTypes.STRING,
    columnCountProduct: DataTypes.STRING,
    otherFieldWithColumnNum: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Providers',
  });
  return Providers;
};