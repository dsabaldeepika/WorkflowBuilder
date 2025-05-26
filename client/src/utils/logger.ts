import log from 'loglevel';
import debug from 'debug';

// Initialize debug namespace
const debugLog = debug('workflow-builder:client');

// Configure log level based on environment
if (process.env.NODE_ENV === 'development') {
  log.setLevel('trace');
  localStorage.debug = 'workflow-builder:*';
} else {
  log.setLevel('info');
}

// Create timestamp
const getTimestamp = () => new Date().toISOString();

// Create a context object that can be extended
let context: Record<string, any> = {};

export const setLogContext = (newContext: Record<string, any>) => {
  context = { ...context, ...newContext };
};

// Format the log message with context
const formatMessage = (message: string, data?: any) => {
  const logEntry = {
    timestamp: getTimestamp(),
    context,
    message,
    data
  };
  return logEntry;
};

// Create logger instance
export const logger = {
  trace: (message: string, data?: any) => {
    const logEntry = formatMessage(message, data);
    log.trace(logEntry);
    debugLog('trace:', logEntry);
  },
  
  debug: (message: string, data?: any) => {
    const logEntry = formatMessage(message, data);
    log.debug(logEntry);
    debugLog('debug:', logEntry);
  },
  
  info: (message: string, data?: any) => {
    const logEntry = formatMessage(message, data);
    log.info(logEntry);
    debugLog('info:', logEntry);
  },
  
  warn: (message: string, data?: any) => {
    const logEntry = formatMessage(message, data);
    log.warn(logEntry);
    debugLog('warn:', logEntry);
  },
  
  error: (message: string, error?: Error, data?: any) => {
    const logEntry = formatMessage(message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      ...data
    });
    log.error(logEntry);
    debugLog('error:', logEntry);
  },

  // API request logging
  api: {
    request: (method: string, url: string, data?: any) => {
      const logEntry = formatMessage(`API Request: ${method} ${url}`, { method, url, data });
      log.debug(logEntry);
      debugLog('api:request:', logEntry);
    },
    
    response: (method: string, url: string, status: number, data?: any) => {
      const logEntry = formatMessage(`API Response: ${method} ${url} (${status})`, {
        method,
        url,
        status,
        data
      });
      log.debug(logEntry);
      debugLog('api:response:', logEntry);
    },
    
    error: (method: string, url: string, error: any) => {
      const logEntry = formatMessage(`API Error: ${method} ${url}`, {
        method,
        url,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined
      });
      log.error(logEntry);
      debugLog('api:error:', logEntry);
    }
  },

  // Component lifecycle logging
  component: {
    mount: (componentName: string, props?: any) => {
      const logEntry = formatMessage(`Component Mounted: ${componentName}`, { componentName, props });
      log.debug(logEntry);
      debugLog('component:mount:', logEntry);
    },
    
    unmount: (componentName: string) => {
      const logEntry = formatMessage(`Component Unmounted: ${componentName}`, { componentName });
      log.debug(logEntry);
      debugLog('component:unmount:', logEntry);
    },
    
    update: (componentName: string, prevProps?: any, newProps?: any) => {
      const logEntry = formatMessage(`Component Updated: ${componentName}`, {
        componentName,
        prevProps,
        newProps
      });
      log.debug(logEntry);
      debugLog('component:update:', logEntry);
    },
    
    error: (componentName: string, error: Error) => {
      const logEntry = formatMessage(`Component Error: ${componentName}`, {
        componentName,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
      log.error(logEntry);
      debugLog('component:error:', logEntry);
    }
  },

  // State management logging
  state: {
    change: (storeName: string, action: string, prevState: any, nextState: any) => {
      const logEntry = formatMessage(`State Change: ${storeName} - ${action}`, {
        storeName,
        action,
        prevState,
        nextState,
        diff: getDiff(prevState, nextState)
      });
      log.debug(logEntry);
      debugLog('state:change:', logEntry);
    }
  }
};

// Helper function to compute state changes
function getDiff(prevState: any, nextState: any) {
  const diff: Record<string, { from: any; to: any }> = {};
  
  const allKeys = new Set([...Object.keys(prevState), ...Object.keys(nextState)]);
  
  allKeys.forEach(key => {
    if (prevState[key] !== nextState[key]) {
      diff[key] = {
        from: prevState[key],
        to: nextState[key]
      };
    }
  });
  
  return diff;
}

export default logger; 