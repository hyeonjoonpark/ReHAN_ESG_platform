const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/sequelize');

// USER 테이블 모델
const User = sequelize.define('User', {
  phone_number: {
    type: DataTypes.STRING(11),
    primaryKey: true,
    allowNull: false,
    validate: {
      len: [10, 11],
      isNumeric: true
    }
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
  tableName: 'USER',
  timestamps: false
});

module.exports = User; 