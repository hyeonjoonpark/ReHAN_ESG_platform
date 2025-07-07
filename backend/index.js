// 환경 변수 로드
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

// 미들웨어 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

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

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ReHAN ESG 플랫폼의 서버가 ${PORT}번 포트에서 실행중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`데이터베이스 호스트: ${process.env.DB_HOST || 'localhost'}`);
});