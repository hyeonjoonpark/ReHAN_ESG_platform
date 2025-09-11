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
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectTimeout: 60000,
    multipleStatements: true,
    connectionLimit: 10
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
