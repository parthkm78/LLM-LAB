const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

let sequelize;

const connectDatabase = async () => {
  try {
    // Database configuration
    const config = {
      dialect: process.env.DB_DIALECT || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'llm_analyzer',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: process.env.NODE_ENV === 'production' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    };

    // Create Sequelize instance
    if (process.env.DATABASE_URL) {
      sequelize = new Sequelize(process.env.DATABASE_URL, config);
    } else {
      sequelize = new Sequelize(config.database, config.username, config.password, config);
    }

    // Test the connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Sync models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized.');
    }

    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

const getSequelize = () => {
  if (!sequelize) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return sequelize;
};

module.exports = {
  connectDatabase,
  getSequelize,
  sequelize
};
