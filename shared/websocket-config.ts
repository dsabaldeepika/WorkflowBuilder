/**
 * WebSocket Configuration
 * This file centralizes WebSocket configuration settings
 */
export const WS_CONFIG = {
  // Server configuration
  host: process.env.WS_HOST || '',
  port: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : (process.env.NODE_ENV === 'development' ? 3100 : 5000),
  securePort: process.env.WS_SECURE_PORT ? parseInt(process.env.WS_SECURE_PORT) : (process.env.NODE_ENV === 'development' ? 3443 : undefined),
  path: '/ws',

  // Reconnection settings
  reconnect: {
    // Whether to attempt reconnection
    enabled: true,
    // Initial delay before retry (ms)
    initialDelay: 1000,
    // Maximum delay between retries (ms)
    maxDelay: 30000,
    // Factor to multiply delay by after each attempt
    multiplier: 1.5,
    // Maximum number of reconnection attempts (0 = unlimited)
    maxAttempts: 0
  },

  // Message types
  messageTypes: {
    // System messages
    CONNECTION: 'connection_established',
    DISCONNECT: 'client_disconnected',
    ERROR: 'error',
    PING: 'ping',
    PONG: 'pong',

    // Workflow messages
    NODE_UPDATE: 'node_update',
    EDGE_UPDATE: 'edge_update',
    WORKFLOW_UPDATE: 'workflow_update',
    
    // Collaboration messages
    USER_JOINED: 'user_joined',
    USER_LEFT: 'user_left',
    CURSOR_POSITION: 'cursor_position'
  },

  // Timeouts and limits
  timeouts: {
    connection: 10000,     // Connection timeout in milliseconds
    heartbeat: 30000,      // Heartbeat interval in milliseconds
    acknowledgment: 5000   // Message acknowledgment timeout
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    maxMessagesPerSecond: 50,
    burstSize: 100
  }
};
