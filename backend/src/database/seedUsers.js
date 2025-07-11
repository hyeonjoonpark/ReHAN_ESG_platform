const { sequelize } = require('./sequelize');
const User = require('../models/user/User');

// 테스트용 사용자 데이터 추가
const seedUsers = async () => {
  try {
    // 데이터베이스 동기화
    await sequelize.sync({ force: false });
    
    // 테스트 사용자 생성
    const testUsers = [
      {
        phone_number: '01012345678',
        user_name: '김철수',
        user_point: 1500
      },
      {
        phone_number: '01098765432',
        user_name: '이영희',
        user_point: 2300
      },
      {
        phone_number: '01055556666',
        user_name: '박민수',
        user_point: 800
      }
    ];

    for (const userData of testUsers) {
      // 기존 사용자가 있는지 확인
      const existingUser = await User.findOne({
        where: { phone_number: userData.phone_number }
      });

      if (!existingUser) {
        await User.create(userData);
        console.log(`사용자 생성: ${userData.user_name} (${userData.phone_number})`);
      } else {
        console.log(`사용자 이미 존재: ${userData.user_name} (${userData.phone_number})`);
      }
    }

    console.log('사용자 시드 데이터 생성 완료');
  } catch (error) {
    console.error('사용자 시드 데이터 생성 오류:', error);
  }
};

// 직접 실행할 경우
if (require.main === module) {
  seedUsers().then(() => {
    process.exit(0);
  });
}

module.exports = seedUsers; 