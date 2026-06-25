import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface OtpLogAttributes {
  id: number;
  phoneNumber: string;
  action: 'request_otp' | 'verify_otp' | 'verify_success' | 'verify_failed';
  token?: string;
  refCode?: string;
  pin?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  responseData?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OtpLogCreationAttributes extends Optional<OtpLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OtpLog extends Model<OtpLogAttributes, OtpLogCreationAttributes> implements OtpLogAttributes {
  public id!: number;
  public phoneNumber!: string;
  public action!: 'request_otp' | 'verify_otp' | 'verify_success' | 'verify_failed';
  public token!: string;
  public refCode!: string;
  public pin!: string;
  public ipAddress!: string;
  public userAgent!: string;
  public status!: 'pending' | 'success' | 'failed' | 'expired';
  public responseData!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OtpLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: 'phone_number',
    },
    action: {
      type: DataTypes.ENUM('request_otp', 'verify_otp', 'verify_success', 'verify_failed'),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ref_code',
    },
    pin: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
    },
    responseData: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'response_data',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'otp_logs',
    timestamps: true,
    underscored: true,
  }
);

export default OtpLog;