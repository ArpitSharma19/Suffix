const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Image = sequelize.define('Image', {
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagePublicId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = Image;

