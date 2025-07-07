// 이 파일을 복사하여 config.js로 이름을 변경하고 사용하세요
// 또는 .env 파일을 생성하여 환경 변수를 설정하세요

module.exports = {
  database: {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'rehan_esg_platform',
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password'
  },
  app: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here'
  }
}; 