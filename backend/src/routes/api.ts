import express, { Request, Response } from 'express';
import * as dataService from '../services/dataService.js';

const router = express.Router();

/**
 * GET /api/devices
 * Get all connected devices
 */
router.get('/devices', async (req: Request, res: Response) => {
  try {
    const devices = await dataService.getAllDevices();
    res.json({
      success: true,
      data: devices,
      count: devices.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch devices',
    });
  }
});

/**
 * GET /api/devices/:deviceId
 * Get specific device details
 */
router.get('/devices/:deviceId', async (req: Request, res: Response) => {
  try {
    const device = await dataService.getDeviceById(req.params.deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch device',
    });
  }
});

/**
 * GET /api/devices/:deviceId/stats
 * Get device performance stats
 */
router.get('/devices/:deviceId/stats', async (req: Request, res: Response) => {
  try {
    const stats = await dataService.getDeviceStats(req.params.deviceId);
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    });
  }
});

/**
 * GET /api/devices/:deviceId/logs
 * Get logs for a specific device
 */
router.get('/devices/:deviceId/logs', async (req: Request, res: Response) => {
  try {
    const { type, limit = '50', startTime, endTime } = req.query;

    const logs = await dataService.getDeviceLogs(req.params.deviceId, {
      logType: type as string | undefined,
      startTime: startTime as string | undefined,
      endTime: endTime as string | undefined,
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch logs',
    });
  }
});

/**
 * GET /api/stats
 * Get aggregated statistics across all devices
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await dataService.getAggregatedStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/activity-timeline
 * Get activity timeline for dashboard
 */
router.get('/activity-timeline', async (req: Request, res: Response) => {
  try {
    const { hours = '24' } = req.query;
    const timeline = await dataService.getActivityTimeline(parseInt(hours as string));

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch timeline',
    });
  }
});

/**
 * GET /api/alerts
 * Get recent alerts and critical logs
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;
    const alerts = await dataService.getAlerts(parseInt(limit as string));

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch alerts',
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

export default router;
