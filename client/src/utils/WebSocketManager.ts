import { WS_CONFIG } from '../../../shared/websocket-config';

export interface WebSocketMessage {
  type: string;
  payload: any;
  clientId?: string;
  timestamp?: number;
}

interface WebSocketConfig {
  reconnect: {
    enabled: boolean;
    initialDelay: number;
    maxDelay: number;
    multiplier: number;
    maxAttempts: number;
  };
}

/**
 * WebSocket connection manager class
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private clientId: string | null = null;
  
  constructor(
    private url: string,
    private onMessage: (data: WebSocketMessage) => void,
    private onError: (error: Error) => void,
    private config: WebSocketConfig['reconnect'] = WS_CONFIG.reconnect
  ) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'connection_established':
              this.clientId = data.payload.clientId;
              console.log(`Connection established with ID: ${this.clientId}`);
              break;
              
            case 'pong':
              // Heartbeat response received
              break;
              
            case 'error':
              console.error('Server error:', data.payload);
              this.onError(new Error(data.payload.message));
              break;
              
            case 'client_disconnected':
              // Handle other client disconnection
              console.log(`Client ${data.payload.clientId} disconnected`);
              break;
              
            default:
              // Pass message to handler
              this.onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError(new Error('WebSocket connection error'));
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private startHeartbeat() {
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      this.send({
        type: 'ping',
        payload: { timestamp: Date.now() }
      });
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (!this.config.enabled) return;
    
    if (this.config.maxAttempts > 0 && this.reconnectAttempts >= this.config.maxAttempts) {
      console.log('Max reconnection attempts reached');
      this.onError(new Error('Failed to reconnect after maximum attempts'));
      return;
    }

    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.multiplier, this.reconnectAttempts),
      this.config.maxDelay
    );

    console.log(`Attempting to reconnect in ${delay}ms...`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  send(data: Omit<WebSocketMessage, 'clientId' | 'timestamp'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        ...data,
        clientId: this.clientId || undefined,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data);
      this.onError(new Error('WebSocket is not connected'));
    }
  }

  close() {
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }
}
