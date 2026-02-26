const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Content = sequelize.define('Content', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.JSON,
        allowNull: true
    }
});

module.exports = Content;
