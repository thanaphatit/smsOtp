'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otp_logs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      action: {
        type: Sequelize.ENUM('request_otp', 'verify_otp', 'verify_success', 'verify_failed'),
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ref_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pin: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
      },
      response_data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('otp_logs', ['phone_number'], {
      name: 'idx_otp_logs_phone_number',
    });
    await queryInterface.addIndex('otp_logs', ['token'], {
      name: 'idx_otp_logs_token',
    });
    await queryInterface.addIndex('otp_logs', ['status'], {
      name: 'idx_otp_logs_status',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('otp_logs');
  },
};