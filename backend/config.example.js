/**
 * 환경 변수 설정 예시
 */
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
  },
  serial: {
    port: process.env.SERIAL_PORT || '/dev/ttyTHS1', // Tegra UART 또는 /dev/ttyUSB0 for USB-Serial
    baudRate: parseInt(process.env.SERIAL_BAUD_RATE) || 115200
  },
  websocket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000'
  }
}; 