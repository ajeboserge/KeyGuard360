import express, { Express } from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { WebSocketService } from './services/websocketService.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'KeyGuard360 Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      devices: '/api/devices',
      deviceDetails: '/api/devices/:deviceId',
      deviceStats: '/api/devices/:deviceId/stats',
      deviceLogs: '/api/devices/:deviceId/logs',
      aggregatedStats: '/api/stats',
      activityTimeline: '/api/activity-timeline',
      alerts: '/api/alerts',
      health: '/api/health',
      websocket: `ws://localhost:${process.env.WS_PORT || 3001}`,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log('KeyGuard360 Backend API');
  console.log(`${'='.repeat(60)}`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket running on ws://localhost:${PORT}`);
  console.log(`Connected clients: ${wsService.getClientCount()}`);
  console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    wsService.shutdown();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    wsService.shutdown();
    process.exit(0);
  });
});

export { wsService };
