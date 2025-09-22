const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

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

const createLogger = (tag) => ({
  error: (message, meta) => baseLog(console.error, 'error', tag, message, meta),
  warn: (message, meta) => baseLog(console.warn, 'warn', tag, message, meta),
  info: (message, meta) => baseLog(console.log, 'info', tag, message, meta),
  debug: (message, meta) => baseLog(console.log, 'debug', tag, message, meta),
});

module.exports = { createLogger };


