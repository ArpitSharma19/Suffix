const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    dialectOptions: (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require') ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: process.env.DB_CA || undefined
      }
    } : {}
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected...');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
