import { Sequelize } from 'sequelize';
import sequelize from '../config/database';
import OtpLog from './OtpLog';

const db: {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  OtpLog: typeof OtpLog;
} = {
  sequelize,
  Sequelize,
  OtpLog,
};

export default db;
export { sequelize, Sequelize, OtpLog };