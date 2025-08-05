// 환경 변수 로드
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { testConnection } = require("./src/database/sequelize");
const authRoutes = require("./src/routes/auth");
const SerialHandler = require("./src/serial/serialHandler");
const SocketHandler = require("./src/socket/socketHandler");

const app = express();
const server = http.createServer(app);

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

// Socket.IO 서버 초기화
const socketHandler = new SocketHandler(server);
const io = socketHandler.getIO();

// SerialPort 핸들러 초기화
const serialHandler = new SerialHandler(io);
serialHandler.initialize();

// 하드웨어 상태 API 엔드포인트
app.get('/api/v1/hardware/status', (req, res) => {
  const serialStatus = serialHandler.getConnectionStatus();
  const connectedClients = socketHandler.getConnectedClientsCount();
  
  res.json({
    serial: serialStatus,
    websocket: {
      connectedClients: connectedClients
    },
    timestamp: new Date().toISOString()
  });
});

// 하드웨어로 시리얼 데이터 전송 엔드포인트
app.post('/api/v1/hardware/send', (req, res) => {
  const { data } = req.body;
  
  const success = serialHandler.sendData(data);
  
  if (success) {
    res.json({
      message: '하드웨어로 데이터 전송 완료',
      success: true,
      data: data
    });
  } else {
    res.status(500).json({
      message: '하드웨어 데이터 전송 실패',
      success: false
    });
  }
});

// 하드웨어 테스트용 엔드포인트 (개발용)
app.post('/api/v1/hardware/test', (req, res) => {
  const { command } = req.body;
  
  if (command === 'belt_separator_complete') {
    console.log('🧪 테스트 API: 띠분리 완료 신호 전송');
    
    // 테스트용으로 띠분리 완료 신호 전송
    io.emit('hardware_status', {
      type: 'belt_separator_complete',
      data: { belt_separator: 1 },
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ WebSocket으로 belt_separator_complete 이벤트 전송 완료');
    
    res.json({ 
      message: '띠분리 완료 테스트 신호가 전송되었습니다.',
      success: true 
    });
  } else if (command === 'hopper_open') {
    // 테스트용으로 투입구 열림 신호 전송
    io.emit('hardware_status', {
      type: 'hopper_open',
      data: {
        motor_stop: 0,
        hopper_open: 1,
        status_ok: 0,
        status_error: 0,
        grinder_on: 0,
        grinder_off: 0,
        grinder_foword: 0,
        grinder_reverse: 0,
        grinder_stop: 0
      },
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      message: '투입구 열림 테스트 신호가 전송되었습니다.',
      success: true 
    });
  } else if (command === 'full_sequence') {
    // 전체 시퀀스 테스트 (띠분리 완료 → 투입구 열림)
    io.emit('hardware_status', {
      type: 'belt_separator_complete',
      data: { belt_separator: 1 },
      timestamp: new Date().toISOString()
    });
    
    // 2초 후 투입구 열림 신호 전송
    setTimeout(() => {
      io.emit('hardware_status', {
        type: 'hopper_open',
        data: {
          motor_stop: 0,
          hopper_open: 1,
          status_ok: 0,
          status_error: 0,
          grinder_on: 0,
          grinder_off: 0,
          grinder_foword: 0,
          grinder_reverse: 0,
          grinder_stop: 0
        },
        timestamp: new Date().toISOString()
      });
    }, 2000);
    
    res.json({ 
      message: '전체 시퀀스 테스트가 시작되었습니다 (띠분리 완료 → 투입구 열림).',
      success: true 
    });
  } else if (command === 'simulate_serial') {
    // 시리얼 데이터 시뮬레이션 (실제 시리얼 핸들러를 통과)
    console.log('🧪 시리얼 데이터 시뮬레이션: {"belt_separator":1}');
    if (serialHandler) {
      serialHandler.handleSerialData('{"belt_separator":1}');
    }
    
    res.json({
      message: '시리얼 데이터 시뮬레이션 완료: {"belt_separator":1}',
      success: true
    });
  } else {
    res.status(400).json({ 
      message: '알 수 없는 명령입니다. 사용 가능한 명령: belt_separator_complete, hopper_open, full_sequence, simulate_serial',
      success: false 
    });
  }
});

// 데이터베이스 연결 테스트 및 시드 데이터 생성
const initializeDatabase = async () => {
  await testConnection();
};

initializeDatabase();

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`ReHAN ESG 플랫폼의 서버가 ${PORT}번 포트에서 실행중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`데이터베이스 호스트: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`WebSocket 서버가 활성화되었습니다.`);
  console.log(`SerialPort 초기화 완료`);
});

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('서버 종료 중...');
  serialHandler.close();
  server.close(() => {
    console.log('서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});