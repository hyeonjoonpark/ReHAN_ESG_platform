const { Sequelize } = require('sequelize');

// 데이터베이스 연결 설정
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+09:00',
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    query: {
      raw: true
    },
    // MySQL 연결 시 문자셋 명시적 설정
    multipleStatements: true,
    // 연결 문자열에 문자셋 추가
    connectionLimit: 10,
    // 초기 연결 시 문자셋 설정
    init: {
      query: "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    }
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: false
  }
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결이 성공적으로 설정되었습니다.');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
  }
};

module.exports = { sequelize, testConnection }; 