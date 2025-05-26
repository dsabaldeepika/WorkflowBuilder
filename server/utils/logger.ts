import winston from 'winston';
import { Request } from 'express';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add colors
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.splat !== undefined ? `${info.splat}` : ' '}${info.metadata ? ` - ${JSON.stringify(info.metadata)}` : ''}`
  )
);

// Define which transports the logger must use to print out messages
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Allow to print all the messages inside the all.log file
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object with a 'write' function that will be used by morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Custom logging functions
export const logRequest = (req: Request, message: string, metadata?: any) => {
  logger.http(message, {
    metadata: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: (req as any).user?.id,
      ...metadata,
    },
  });
};

export const logError = (error: Error, metadata?: any) => {
  logger.error(error.message, {
    metadata: {
      name: error.name,
      stack: error.stack,
      ...metadata,
    },
  });
};

export const logInfo = (message: string, metadata?: any) => {
  logger.info(message, { metadata });
};

export const logDebug = (message: string, metadata?: any) => {
  logger.debug(message, { metadata });
};

export const logWarn = (message: string, metadata?: any) => {
  logger.warn(message, { metadata });
};

// Export the logger
export default logger; 