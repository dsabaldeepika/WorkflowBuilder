import { toast } from '@/hooks/use-toast';

interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  context?: Record<string, any>;
}

class Logger {
  private logToConsole(level: string, message: string, error?: Error, context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(error && { error: error.message, stack: error.stack }),
      ...(context && { context }),
    };

    switch (level) {
      case 'error':
        console.error(logData);
        break;
      case 'warn':
        console.warn(logData);
        break;
      case 'info':
        console.info(logData);
        break;
      default:
        console.log(logData);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.logToConsole('debug', message, undefined, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.logToConsole('info', message, undefined, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.logToConsole('warn', message, undefined, context);
  }

  error(message: string, error: Error, context?: Record<string, any>) {
    this.logToConsole('error', message, error, context);
  }

  // Component lifecycle logging
  component = {
    mount: (name: string, props?: Record<string, any>) => {
      this.info(`Component mounted: ${name}`, props);
    },
    unmount: (name: string) => {
      this.info(`Component unmounted: ${name}`);
    },
    update: (name: string, props?: Record<string, any>) => {
      this.debug(`Component updated: ${name}`, props);
    },
  };

  // API request logging
  api = {
    request: (method: string, url: string, data?: any) => {
      this.debug(`API Request: ${method} ${url}`, { data });
    },
    response: (method: string, url: string, status: number, data?: any) => {
      this.debug(`API Response: ${method} ${url}`, { status, data });
    },
    error: (method: string, url: string, error: Error) => {
      this.error(`API Error: ${method} ${url}`, error);
    },
  };
}

export const logger = new Logger(); 