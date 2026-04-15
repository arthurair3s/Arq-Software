const formatMessage = (level, message, context = '') => {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` [${context}]` : '';
  return `${timestamp} | ${level.toUpperCase().padEnd(7)} |${ctx} ${message}`;
};

export const logger = {
  info: (message, context) => console.log(formatMessage('info', message, context)),
  warn: (message, context) => console.warn(formatMessage('warn', message, context)),
  error: (message, context) => console.error(formatMessage('error', message, context)),
  debug: (message, context) => console.debug(formatMessage('debug', message, context)),
};
