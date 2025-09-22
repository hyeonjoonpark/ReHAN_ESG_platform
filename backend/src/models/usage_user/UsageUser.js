const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/sequelize');

// USAGE_COUNT 테이블 모델
const UsageUser = sequelize.define('UsageUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    foreignKey: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'TBL_USAGE_USER',
  timestamps: false
});

module.exports = UsageUser; 