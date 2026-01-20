# System Architecture & Data Flow

## Component Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        KEYGUARD360 SYSTEM                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │            MONITORING AGENTS (Python)                        │   │
│  │  Runs on: Windows, macOS, Linux                             │   │
│  │  Instances: Multiple devices with unique device_id          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Device 1              Device 2              Device N         │   │
│  │  ┌────────────────┐    ┌────────────────┐   ┌────────────┐ │   │
│  │  │ • Screenshots  │    │ • Screenshots  │   │ • Keylogs  │ │   │
│  │  │ • Keylogs      │    │ • System Info  │   │ • Activity │ │   │
│  │  │ • System Info  │    │ • Keylogs      │   │ • Alerts   │ │   │
│  │  └────────────────┘    └────────────────┘   └────────────┘ │   │
│  │          │                     │                    │        │   │
│  │          └─────────────────────┴────────────────────┘        │   │
│  │                           │                                  │   │
│  │                    AWS SDK (boto3)                           │   │
│  │                           │                                  │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                               │                                      │
│  ┌────────────────────────────▼──────────────────────────────────┐  │
│  │            AWS SERVICES (Cloud)                              │  │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                                                │ │
│  │  DynamoDB              S3                    SNS             │ │
│  │  ┌─────────────┐     ┌─────────────┐    ┌──────────┐        │ │
│  │  │ devices     │     │screenshots/ │    │ Alerts   │        │ │
│  │  │ ┌─────────┐ │     │ device-id/  │    │ Topic    │        │ │
│  │  │ │ device_ │ │     │ screenshots │    └──────────┘        │ │
│  │  │ │ id (PK) │ │     │             │                        │ │
│  │  │ ├─────────┤ │     └─────────────┘                        │ │
│  │  │ │status   │ │                                             │ │
│  │  │ │hostname │ │                                             │ │
│  │  │ │last_seen│ │                                             │ │
│  │  │ └─────────┘ │                                             │ │
│  │  └─────────────┘                                             │ │
│  │                                                                │ │
│  │  logs                  GSI: device_id-timestamp               │ │
│  │  ┌──────────────┐                                             │ │
│  │  │ log_id (PK)  │                                             │ │
│  │  ├──────────────┤                                             │ │
│  │  │ device_id    │                                             │ │
│  │  │ timestamp    │                                             │ │
│  │  │ type         │ (screenshot, keylog, alert, etc.)          │ │
│  │  │ data         │                                             │ │
│  │  └──────────────┘                                             │ │
│  │                                                                │ │
│  └────────────────────────────┬──────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────▼──────────────────────────────────┐ │
│  │         BACKEND API (Node.js/Express/TypeScript)             │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                                                │ │
│  │  REST API Endpoints              WebSocket Server            │ │
│  │  ┌──────────────────────────┐    ┌────────────────────┐     │ │
│  │  │ GET /api/devices         │    │ Real-time Updates  │     │ │
│  │  │ GET /api/devices/:id     │    │ • stats_update     │     │ │
│  │  │ GET /api/devices/:id/    │    │ • activity_update  │     │ │
│  │  │     stats                │    │ • alert            │     │ │
│  │  │ GET /api/devices/:id/    │    │ • device_status    │     │ │
│  │  │     logs                 │    └────────────────────┘     │ │
│  │  │ GET /api/stats           │                               │ │
│  │  │ GET /api/activity-       │    Services                  │ │
│  │  │     timeline             │    ┌──────────────────────┐  │ │
│  │  │ GET /api/alerts          │    │ • Data aggregation   │  │ │
│  │  │ GET /api/health          │    │ • AWS queries        │  │ │
│  │  └──────────────────────────┘    │ • Authentication     │  │ │
│  │                                   │ • Error handling     │  │ │
│  │                                   └──────────────────────┘  │ │
│  └───────────────┬──────────────────────────────┬──────────────┘ │
│                  │ HTTP/HTTPS                   │ WebSocket      │
│                  └──────────────┬────────────────┘                │
│                                 │                                 │
│  ┌──────────────────────────────▼───────────────────────────────┐ │
│  │           FRONTEND (React/TypeScript)                        │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                                                │ │
│  │  React Hooks (useApi.ts)         Components                  │ │
│  │  ┌──────────────────────────┐    ┌──────────────────────┐   │ │
│  │  │ useDevices()             │    │ Dashboard            │   │ │
│  │  │ useDevice()              │    │ ├─ Metrics Cards     │   │ │
│  │  │ useDeviceStats()         │    │ ├─ Activity Chart    │   │ │
│  │  │ useDeviceLogs()          │    │ ├─ Threat Pie Chart  │   │ │
│  │  │ useAggregatedStats()     │    │ └─ Recent Alerts    │   │ │
│  │  │ useActivityTimeline()    │    │                      │   │ │
│  │  │ useAlerts()              │    │ DeviceList           │   │ │
│  │  │ useWebSocket()           │    │ ActivityMonitor      │   │ │
│  │  │ useRealtimeData()        │    │ ThreatAnalytics      │   │ │
│  │  └──────────────────────────┘    │ AlertsPanel          │   │ │
│  │                                   └──────────────────────┘   │ │
│  │                                                                │ │
│  │  Dashboard (running on http://localhost:5173)                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### Initial Setup & Device Registration
```
1. Agent starts on Device
   │
2. Generate unique device_id
   ├─ Based on: hostname + MAC address
   │
3. Upload initial status to DynamoDB
   ├─ Table: keyguard360-devices
   ├─ Data: device_id, hostname, OS, status=online
   │
4. Start monitoring
   ├─ Screenshot interval: 5 minutes
   ├─ Keylog upload: when buffer reaches 100 keys
   ├─ Status update: every 1 minute
```

### Continuous Monitoring
```
Device (Agent)              AWS                    Backend API         Frontend
   │                         │                        │                  │
   ├──screenshot───────────► DynamoDB/S3             │                  │
   │                         │                        │                  │
   ├──keylogs────────────────► DynamoDB              │                  │
   │                         │                        │                  │
   ├──system_info────────────► DynamoDB              │                  │
   │                         │                        │                  │
   ├──status_update─────────► DynamoDB              │                  │
   │                         │                        │                  │
   │                         ├─ frontend requests ──► API queries data  │
   │                         │                        │                  │
   │                         │                        ├─────────────────► Display on Dashboard
   │                         │                        │                  │
   │                         ├─ WebSocket updates ──► Real-time push ───► Update without refresh
```

### Dashboard Update Cycle
```
1. Component mounts
   ├─ useDevices() hook called
   │
2. Initial fetch
   ├─ GET /api/devices
   ├─ GET /api/stats
   ├─ GET /api/activity-timeline
   │
3. Subscribe to WebSocket
   ├─ Connect to ws://localhost:3000
   ├─ Subscribe to channels: activity, alerts
   │
4. Display results
   ├─ Render device list
   ├─ Show activity chart
   ├─ Display alert list
   │
5. Auto-refetch at interval
   ├─ Every 30 seconds: refresh device list
   ├─ Every 10 seconds: refresh stats
   ├─ WebSocket: real-time updates
   │
6. Cleanup on unmount
   ├─ Cancel pending requests
   ├─ Close WebSocket connection
```

## Scalability Tiers

### Tier 1: Small Deployment (1-10 devices)
```
Agent → DynamoDB (on-demand) → Backend API → Frontend
Resources needed:
  - 1 backend instance (t3.micro)
  - DynamoDB on-demand billing
  - S3 standard storage
Cost: ~$10-30/month
```

### Tier 2: Medium Deployment (10-100 devices)
```
Agents → DynamoDB (provisioned) → Backend API → Frontend
         ↓
        S3 (lifecycle policies)
Resources needed:
  - 1 backend instance (t3.small)
  - DynamoDB 10-25 RCU/WCU
  - CloudFront for S3
  - Redis cache for hot data
Cost: ~$50-150/month
```

### Tier 3: Large Deployment (100-1000 devices)
```
Agents → DynamoDB (auto-scaling) → API Load Balancer → Multiple Backend Instances
         ↓
        S3 + CloudFront
         ↓
        Redis Cache
         ↓
        CloudWatch Monitoring
Resources needed:
  - Auto-scaling EC2 instances (3-5 instances)
  - DynamoDB auto-scaling
  - ElastiCache Redis
  - CloudFront distribution
  - RDS for additional data (optional)
Cost: ~$200-500/month
```

## Network Architecture

```
┌─ Firewall/Security Groups
│
├─ Outbound (Agent → AWS)
│  ├─ HTTPS 443 to DynamoDB
│  ├─ HTTPS 443 to S3
│  └─ HTTPS 443 to SNS
│
├─ Inbound (Frontend → Backend)
│  ├─ HTTP 80 or HTTPS 443 (REST API)
│  ├─ WebSocket 80/443 (Real-time)
│  └─ CORS enabled for frontend domain
│
└─ Internal (Backend → AWS)
   ├─ HTTPS to DynamoDB
   ├─ HTTPS to S3
   └─ HTTPS to SNS (alerts)
```

## Performance Characteristics

### Latency
```
Device → DynamoDB:          ~50-100ms (same region)
Backend → DynamoDB:         ~20-50ms (same region)
Frontend → Backend HTTP:    ~100-200ms
Frontend ← Backend WS:      ~50-100ms (push updates)
```

### Throughput
```
Single Backend Instance:
  ├─ 100 concurrent connections
  ├─ 1000 req/sec
  ├─ 10+ devices supported
  │
With Load Balancing:
  ├─ 10,000+ concurrent connections
  ├─ 100,000+ req/sec
  ├─ 1000+ devices supported
```

### Storage
```
Per Device (Monthly):
  ├─ Screenshots: 1.5GB (assuming 5 screenshots/day @ 2MB each)
  ├─ Keylogs: 10MB (assuming 50KB/day)
  ├─ System info: 1MB
  └─ Total: ~1.5GB per device per month

For 1000 devices:
  └─ ~1.5TB per month
     Estimated cost: $30-50/month (S3 standard-IA)
```

---

This architecture is designed for scalability, reliability, and real-time monitoring across multiple devices.
