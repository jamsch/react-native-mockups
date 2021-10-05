export enum LogLevels {
  silent = 0,
  error = 1,
  warn = 2,
  info = 3,
  debug = 4,
  trace = 5,
}

let logLevel = LogLevels.info;

export const setLogLevel = (level: LogLevels) => {
  logLevel = level;
};

const debug = (...message: any[]) => {
  if (logLevel < LogLevels.debug) {
    return;
  }
  console.debug(...message);
};

const info = (...message: any[]) => {
  if (logLevel < LogLevels.info) {
    return;
  }
  console.info(...message);
};

const warn = (...message: any[]) => {
  if (logLevel < LogLevels.warn) {
    return;
  }
  console.warn(...message);
};

const error = (...message: any[]) => {
  if (logLevel < LogLevels.error) {
    return;
  }
  console.error(...message);
};

const trace = (...message: any[]) => {
  if (logLevel < LogLevels.trace) {
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
