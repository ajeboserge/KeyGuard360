import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  timestamp?: string;
}

/**
 * Generic hook for fetching data from the backend API
 */
export function useApi<T>(
  endpoint: string,
  options: {
    skip?: boolean;
    refetchInterval?: number;
    dependencies?: any[];
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const fetchData = useCallback(async () => {
    if (options.skip) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, options.skip]);

  useEffect(() => {
    fetchData();

    // Setup auto-refetch interval if specified
    if (options.refetchInterval && options.refetchInterval > 0) {
      intervalRef.current = setInterval(fetchData, options.refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, options.refetchInterval, ...(options.dependencies || [])]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch all devices
 */
export function useDevices(refetchInterval: number = 30000) {
  return useApi('/devices', { refetchInterval });
}

/**
 * Hook to fetch a specific device
 */
export function useDevice(deviceId: string, refetchInterval: number = 30000) {
  return useApi(`/devices/${deviceId}`, { 
    refetchInterval,
    dependencies: [deviceId],
  });
}

/**
 * Hook to fetch device stats
 */
export function useDeviceStats(deviceId: string, refetchInterval: number = 15000) {
  return useApi(`/devices/${deviceId}/stats`, { 
    refetchInterval,
    dependencies: [deviceId],
  });
}

/**
 * Hook to fetch device logs with filters
 */
export function useDeviceLogs(
  deviceId: string,
  options: {
    type?: string;
    limit?: number;
    refetchInterval?: number;
  } = {}
) {
  const queryParams = new URLSearchParams();
  if (options.type) queryParams.append('type', options.type);
  if (options.limit) queryParams.append('limit', options.limit.toString());

  const endpoint = `/devices/${deviceId}/logs?${queryParams.toString()}`;

  return useApi(endpoint, {
    refetchInterval: options.refetchInterval || 20000,
    dependencies: [deviceId, options.type, options.limit],
  });
}

/**
 * Hook to fetch aggregated stats across all devices
 */
export function useAggregatedStats(refetchInterval: number = 10000) {
  return useApi('/stats', { refetchInterval });
}

/**
 * Hook to fetch activity timeline
 */
export function useActivityTimeline(hours: number = 24, refetchInterval: number = 30000) {
  return useApi(`/activity-timeline?hours=${hours}`, { 
    refetchInterval,
    dependencies: [hours],
  });
}

/**
 * Hook to fetch alerts
 */
export function useAlerts(limit: number = 50, refetchInterval: number = 20000) {
  return useApi(`/alerts?limit=${limit}`, { 
    refetchInterval,
    dependencies: [limit],
  });
}

interface WebSocketMessage {
  type: string;
  data?: any;
  clientId?: string;
  timestamp?: string;
}

/**
 * Hook for WebSocket real-time updates
 */
export function useWebSocket(onMessage?: (message: WebSocketMessage) => void) {
  const [connected, setConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          channel,
        })
      );
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          channel,
        })
      );
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === 'connected') {
          setClientId(message.clientId || null);
        }

        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onMessage]);

  return {
    connected,
    clientId,
    subscribe,
    unsubscribe,
    ws: wsRef.current,
  };
}

/**
 * Hook to combine API fetching with WebSocket real-time updates
 */
export function useRealtimeData<T>(
  endpoint: string,
  wsChannels: string[] = [],
  refetchInterval: number = 30000
) {
  const { data, loading, error, refetch } = useApi<T>(endpoint, { refetchInterval });
  const { connected, subscribe, unsubscribe } = useWebSocket((message) => {
    // Refetch data when receiving WebSocket updates
    if (wsChannels.includes(message.type)) {
      refetch();
    }
  });

  useEffect(() => {
    wsChannels.forEach(subscribe);
    return () => {
      wsChannels.forEach(unsubscribe);
    };
  }, [wsChannels, subscribe, unsubscribe]);

  return { data, loading, error, refetch, wsConnected: connected };
}

/**
 * Hook to health check the backend
 */
export function useBackendHealth() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const result = await response.json();
        setIsHealthy(result.success);
      } catch (error) {
        console.error('Backend health check failed:', error);
        setIsHealthy(false);
      } finally {
        setChecking(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isHealthy, checking };
}
