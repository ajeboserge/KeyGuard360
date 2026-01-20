import WebSocket from 'ws';
import http from 'http';
import { dynamodb, TABLES } from '../config.js';
import * as dataService from './dataService.js';

interface Client {
  ws: WebSocket;
  subscriptions: Set<string>;
}

export class WebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<string, Client> = new Map();
  private updateInterval: NodeJS.Timer | null = null;

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      const client: Client = {
        ws,
        subscriptions: new Set(),
      };

      this.clients.set(clientId, client);
      console.log(`Client connected: ${clientId}`);

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'connected',
          clientId,
          timestamp: new Date().toISOString(),
        })
      );

      // Handle incoming messages
      ws.on('message', (data: string) => {
        this.handleMessage(clientId, data);
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
      });
    });

    // Start periodic updates
    this.startPeriodicUpdates();
  }

  private handleMessage(clientId: string, data: string): void {
    try {
      const message = JSON.parse(data);
      const client = this.clients.get(clientId);

      if (!client) return;

      switch (message.type) {
        case 'subscribe':
          client.subscriptions.add(message.channel);
          console.log(`Client ${clientId} subscribed to ${message.channel}`);
          break;

        case 'unsubscribe':
          client.subscriptions.delete(message.channel);
          console.log(`Client ${clientId} unsubscribed from ${message.channel}`);
          break;

        case 'ping':
          client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;

        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      try {
        // Get updated stats
        const stats = await dataService.getAggregatedStats();

        // Get recent activity
        const timeline = await dataService.getActivityTimeline(1);

        // Send to all connected clients
        this.broadcast({
          type: 'stats_update',
          data: stats,
          timestamp: new Date().toISOString(),
        });

        // Send activity to clients subscribed to activity channel
        this.broadcastToChannel('activity', {
          type: 'activity_update',
          data: timeline,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error in periodic updates:', error);
      }
    }, 10000); // Update every 10 seconds
  }

  private broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  private broadcastToChannel(channel: string, message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  public async notifyDeviceStatus(deviceId: string, status: 'online' | 'offline'): Promise<void> {
    this.broadcast({
      type: 'device_status_change',
      data: {
        device_id: deviceId,
        status,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public async notifyNewLog(log: any): Promise<void> {
    this.broadcastToChannel('logs', {
      type: 'new_log',
      data: log,
      timestamp: new Date().toISOString(),
    });
  }

  public async notifyAlert(alert: any): Promise<void> {
    this.broadcast({
      type: 'alert',
      data: alert,
      timestamp: new Date().toISOString(),
    });
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  private generateClientId(): string {
    return `client-${Math.random().toString(36).substring(2, 11)}`;
  }

  public shutdown(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.wss.close();
  }
}
