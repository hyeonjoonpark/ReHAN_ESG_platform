const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

// ANSI 색상 코드
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m', // 보라색
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  purple: '\x1b[95m', // 밝은 보라색
  pink: '\x1b[38;5;213m', // 분홍색
};

const getCurrentLevel = () => {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return LEVELS[envLevel] ?? LEVELS.info;
};

const shouldLog = (level) => LEVELS[level] <= getCurrentLevel();

const baseLog = (consoleMethod, level, tag, message, meta) => {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
  consoleMethod(`[${ts}] [${level.toUpperCase()}] [${tag}] ${message}${metaString}`);
};

// 색상이 적용된 로그 함수
const coloredLog = (consoleMethod, level, tag, message, meta, color = COLORS.white) => {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
  const coloredMessage = `${color}${message}${COLORS.reset}`;
  consoleMethod(`[${ts}] [${level.toUpperCase()}] [${tag}] ${coloredMessage}${metaString}`);
};

const createLogger = (tag) => ({
  error: (message, meta) => baseLog(console.error, 'error', tag, message, meta),
  warn: (message, meta) => baseLog(console.warn, 'warn', tag, message, meta),
  info: (message, meta) => baseLog(console.log, 'info', tag, message, meta),
  debug: (message, meta) => baseLog(console.log, 'debug', tag, message, meta),
  // 데이터 수신 로그 (하늘색)
  receive: (message, meta) => coloredLog(console.log, 'info', tag, message, meta, COLORS.cyan),
  // 데이터 송신 로그 (분홍색)
  send: (message, meta) => coloredLog(console.log, 'info', tag, message, meta, COLORS.pink),
});

module.exports = { createLogger };


