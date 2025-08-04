// 환경 변수 로드
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { testConnection } = require("./src/database/sequelize");
const authRoutes = require("./src/routes/auth");

const app = express();

// 미들웨어 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// 라우터 설정
app.use('/api/v1', authRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ 
    message: "ReHAN ESG 플랫폼 서버가 정상적으로 실행중입니다.",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// 헬스체크 라우트 (Docker 헬스체크용)
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// 데이터베이스 연결 테스트 및 시드 데이터 생성
const initializeDatabase = async () => {
  await testConnection();
};

initializeDatabase();

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ReHAN ESG 플랫폼의 서버가 ${PORT}번 포트에서 실행중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`데이터베이스 호스트: ${process.env.DB_HOST || 'localhost'}`);
});