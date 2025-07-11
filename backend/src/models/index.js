const User = require('./user/User');
const UsageUser = require('./usage_user/UsageUser');

// 모델 간 관계 설정
User.hasMany(UsageUser, { 
  foreignKey: 'phone_number',
  sourceKey: 'phone_number'
});

UsageUser.belongsTo(User, { 
  foreignKey: 'phone_number',
  targetKey: 'phone_number'
});

module.exports = {
  User,
  UsageUser
}; 