import { WebSocket } from 'ws';
import { WS_CONFIG } from '../../shared/websocket-config';

export interface WebSocketMessage {
  type: string;
  payload: any;
  clientId?: string;
  timestamp?: number;
}

export interface WebSocketClient {
  ws: WebSocket;
  ip: string;
  connectedAt: Date;
  secure?: boolean;
}

interface RateLimitState {
  messageCount: number;
  lastReset: number;
  burstCount: number;
}

/**
 * Rate limiter for WebSocket messages
 */
export class MessageRateLimiter {
  private clientStates = new Map<string, RateLimitState>();

  constructor(private config = WS_CONFIG.rateLimit) {}

  isAllowed(clientId: string): boolean {
    if (!this.config.enabled) return true;

    const now = Date.now();
    const state = this.clientStates.get(clientId) || {
      messageCount: 0,
      lastReset: now,
      burstCount: 0
    };

    // Reset counters if a second has passed
    if (now - state.lastReset >= 1000) {
      state.messageCount = 0;
      state.lastReset = now;
      state.burstCount = Math.max(0, state.burstCount - 1);
    }

    // Check rate limits
    if (state.messageCount >= this.config.maxMessagesPerSecond) {
      if (state.burstCount >= this.config.burstSize) {
        return false;
      }
      state.burstCount++;
    }

    state.messageCount++;
    this.clientStates.set(clientId, state);
    return true;
  }

  removeClient(clientId: string) {
    this.clientStates.delete(clientId);
  }
}

/**
 * Validate WebSocket message format
 */
export function validateMessage(data: any): data is WebSocketMessage {
  if (!data || typeof data !== 'object') return false;
  if (!data.type || typeof data.type !== 'string') return false;
  if (!Object.values(WS_CONFIG.messageTypes).includes(data.type)) return false;
  if (!data.payload || typeof data.payload !== 'object') return false;
  if (data.timestamp && typeof data.timestamp !== 'number') return false;
  return true;
}

/**
 * Create a standard message object
 */
export function createMessage(type: string, payload: any, clientId?: string): WebSocketMessage {
  return {
    type,
    payload,
    clientId,
    timestamp: Date.now()
  };
}

/**
 * Send a message to a WebSocket client with error handling
 */
export function sendMessage(ws: WebSocket, type: string, payload: any): boolean {
  try {
    const message = createMessage(type, payload);
    ws.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

/**
 * Broadcast a message to multiple WebSocket clients
 */
export function broadcastMessage(
  clients: Map<string, WebSocketClient>,
  type: string,
  payload: any,
  excludeClientId?: string
): void {
  const message = createMessage(type, payload);
  const messageStr = JSON.stringify(message);

  clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(messageStr);
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId}:`, error);
      }
    }
  });
}

/**
 * Check if a WebSocket connection is still alive
 */
export function isConnectionAlive(ws: WebSocket): boolean {
  return ws.readyState === WebSocket.OPEN;
}

/**
 * Safely close a WebSocket connection
 */
export function closeConnection(ws: WebSocket, code: number = 1000, reason?: string): void {
  try {
    ws.close(code, reason);
  } catch (error) {
    console.error('Error closing WebSocket connection:', error);
  }
}
