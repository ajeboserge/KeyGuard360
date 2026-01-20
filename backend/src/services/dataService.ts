import { dynamodb, TABLES } from './config.js';

export interface Device {
  device_id: string;
  hostname: string;
  os: string;
  status: 'online' | 'offline';
  last_seen: string;
  agent_version: string;
  system_info: {
    cpu_usage: number;
    memory_percent: number;
    disk_percent: number;
    processor: string;
  };
}

export interface LogEntry {
  log_id: string;
  device_id: string;
  timestamp: string;
  type: string;
  data: any;
  count?: number;
}

/**
 * Get all devices
 */
export async function getAllDevices(): Promise<Device[]> {
  try {
    const result = await dynamodb
      .scan({
        TableName: TABLES.DEVICES,
      })
      .promise();

    return (result.Items || []) as Device[];
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
}

/**
 * Get device by ID
 */
export async function getDeviceById(deviceId: string): Promise<Device | null> {
  try {
    const result = await dynamodb
      .get({
        TableName: TABLES.DEVICES,
        Key: { device_id: deviceId },
      })
      .promise();

    return (result.Item as Device) || null;
  } catch (error) {
    console.error('Error fetching device:', error);
    throw error;
  }
}

/**
 * Get device stats (CPU, Memory, Disk usage)
 */
export async function getDeviceStats(deviceId: string): Promise<any> {
  const device = await getDeviceById(deviceId);
  if (!device) return null;

  return {
    device_id: deviceId,
    hostname: device.hostname,
    cpu_usage: device.system_info?.cpu_usage || 0,
    memory_percent: device.system_info?.memory_percent || 0,
    disk_percent: device.system_info?.disk_percent || 0,
    status: device.status,
    last_seen: device.last_seen,
  };
}

/**
 * Get logs for a device with filters
 */
export async function getDeviceLogs(
  deviceId: string,
  options: {
    logType?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  } = {}
): Promise<LogEntry[]> {
  try {
    const { logType, startTime, endTime, limit = 50 } = options;

    let params: any = {
      TableName: TABLES.LOGS,
      IndexName: 'device_id-timestamp-index', // Assuming this index exists
      KeyConditionExpression: 'device_id = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
      },
      Limit: limit,
      ScanIndexForward: false, // Latest first
    };

    // Add type filter if specified
    if (logType) {
      params.FilterExpression = '#type = :type';
      params.ExpressionAttributeNames = { '#type': 'type' };
      params.ExpressionAttributeValues[':type'] = logType;
    }

    const result = await dynamodb.query(params).promise();
    return (result.Items || []) as LogEntry[];
  } catch (error) {
    console.error('Error fetching logs:', error);
    // Fallback to scan if index doesn't exist
    try {
      const result = await dynamodb
        .scan({
          TableName: TABLES.LOGS,
          FilterExpression: 'device_id = :deviceId',
          ExpressionAttributeValues: {
            ':deviceId': deviceId,
          },
          Limit: options.limit || 50,
        })
        .promise();

      return (result.Items || []) as LogEntry[];
    } catch (scanError) {
      console.error('Scan also failed:', scanError);
      throw scanError;
    }
  }
}

/**
 * Get aggregated stats across all devices
 */
export async function getAggregatedStats(): Promise<any> {
  try {
    const devices = await getAllDevices();

    const stats = {
      total_devices: devices.length,
      active_devices: devices.filter((d) => d.status === 'online').length,
      offline_devices: devices.filter((d) => d.status === 'offline').length,
      avg_cpu_usage: 0,
      avg_memory_usage: 0,
      avg_disk_usage: 0,
    };

    if (devices.length > 0) {
      const cpuValues = devices.map((d) => d.system_info?.cpu_usage || 0);
      const memoryValues = devices.map((d) => d.system_info?.memory_percent || 0);
      const diskValues = devices.map((d) => d.system_info?.disk_percent || 0);

      stats.avg_cpu_usage = Math.round(
        cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
      );
      stats.avg_memory_usage = Math.round(
        memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length
      );
      stats.avg_disk_usage = Math.round(
        diskValues.reduce((a, b) => a + b, 0) / diskValues.length
      );
    }

    return stats;
  } catch (error) {
    console.error('Error calculating aggregated stats:', error);
    throw error;
  }
}

/**
 * Get activity timeline (aggregated events from all devices)
 */
export async function getActivityTimeline(
  hours: number = 24
): Promise<Array<{ hour: string; events: number }>> {
  try {
    const now = new Date();
    const result = await dynamodb
      .scan({
        TableName: TABLES.LOGS,
        FilterExpression: '#timestamp > :startTime',
        ExpressionAttributeNames: { '#timestamp': 'timestamp' },
        ExpressionAttributeValues: {
          ':startTime': new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString(),
        },
      })
      .promise();

    // Group by hour
    const timeline: { [key: string]: number } = {};
    const logs = (result.Items || []) as LogEntry[];

    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      const hour = date.toISOString().substring(0, 13) + ':00';
      timeline[hour] = (timeline[hour] || 0) + 1;
    });

    return Object.entries(timeline)
      .map(([hour, events]) => ({ hour, events }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  } catch (error) {
    console.error('Error fetching activity timeline:', error);
    throw error;
  }
}

/**
 * Get alerts/critical logs
 */
export async function getAlerts(limit: number = 50): Promise<LogEntry[]> {
  try {
    const result = await dynamodb
      .scan({
        TableName: TABLES.LOGS,
        FilterExpression: 'contains(#type, :alert) OR contains(#type, :error)',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: {
          ':alert': 'alert',
          ':error': 'error',
        },
        Limit: limit,
      })
      .promise();

    return (result.Items || []) as LogEntry[];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
}
