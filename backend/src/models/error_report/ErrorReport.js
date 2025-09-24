const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/sequelize');

const ErrorReport = sequelize.define('ErrorReport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  error_content: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
    tableName: 'TBL_ERROR_REPORT',
    timestamps: false
});

module.exports = ErrorReport;