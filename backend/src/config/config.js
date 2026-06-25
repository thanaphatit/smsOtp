require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'sms_otp_user',
    password: process.env.DB_PASSWORD || 'sms_otp_pass',
    database: process.env.DB_NAME || 'sms_otp',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
  },
  test: {
    username: process.env.DB_USER || 'sms_otp_user',
    password: process.env.DB_PASSWORD || 'sms_otp_pass',
    database: process.env.DB_NAME || 'sms_otp_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};