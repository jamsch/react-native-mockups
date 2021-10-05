export const LogLevels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

type LogLevel = keyof typeof LogLevels;

let logLevel: LogLevel = 'info';

export const setLogLevel = (level: LogLevel) => {
  logLevel = level;
};

const debug = (...message: any[]) => {
  if (LogLevels[logLevel] < LogLevels.debug) {
    return;
  }
  console.debug(...message);
};

const info = (...message: any[]) => {
  if (LogLevels[logLevel] < LogLevels.info) {
    return;
  }
  console.info(...message);
};

const warn = (...message: any[]) => {
  if (LogLevels[logLevel] < LogLevels.warn) {
    return;
  }
  console.warn(...message);
};

const error = (...message: any[]) => {
  if (LogLevels[logLevel] < LogLevels.error) {
    return;
  }
  console.error(...message);
};

const trace = (...message: any[]) => {
  if (LogLevels[logLevel] < LogLevels.trace) {
    return;
  }
  console.trace(...message);
};

export default {
  error,
  warn,
  info,
  setLogLevel,
  debug,
  trace,
};
