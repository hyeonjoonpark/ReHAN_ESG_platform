const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/sequelize');

const PetBottle = sequelize.define('PetBottle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  phone_number: {
    type: DataTypes.STRING(11),
    allowNull: false,
    foreignKey: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'TBL_PET_BOTTLE',
  timestamps: false
});

module.exports = PetBottle;