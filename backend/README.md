# KeyGuard360 Backend API

Centralized backend server for KeyGuard360 multi-device monitoring system. Aggregates data from all connected agent devices and serves it via REST API and WebSocket connections.

## Features

- **REST API** for querying devices, logs, and statistics
- **WebSocket** support for real-time data streaming
- **AWS Integration** with DynamoDB and S3
- **Multi-device support** with aggregated analytics
- **Activity timeline** tracking
- **Alert system** for security events

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS credentials (Access Key ID and Secret Access Key)
- Running KeyGuard360 agents on connected devices

### Installation

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update `.env` with your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
DYNAMODB_LOGS_TABLE=keyguard360-logs
DYNAMODB_DEVICES_TABLE=keyguard360-devices
S3_BUCKET=keyguard360-data
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Running the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production build**:

```bash
npm run build
npm start
```

## API Endpoints

### Devices

- **GET** `/api/devices` - Get all devices
- **GET** `/api/devices/:deviceId` - Get device details
- **GET** `/api/devices/:deviceId/stats` - Get device performance stats
- **GET** `/api/devices/:deviceId/logs` - Get device logs (with filters)

**Example:**
```bash
# Get all devices
curl http://localhost:3000/api/devices

# Get device stats
curl http://localhost:3000/api/devices/device-abc123/stats

# Get device logs with filters
curl "http://localhost:3000/api/devices/device-abc123/logs?type=screenshot&limit=20"
```

### Statistics

- **GET** `/api/stats` - Get aggregated stats across all devices
- **GET** `/api/activity-timeline` - Get activity timeline
- **GET** `/api/alerts` - Get recent alerts

**Example:**
```bash
# Get aggregated stats
curl http://localhost:3000/api/stats

# Get activity timeline for last 24 hours
curl "http://localhost:3000/api/activity-timeline?hours=24"

# Get recent alerts
curl "http://localhost:3000/api/alerts?limit=50"
```

### Health

- **GET** `/api/health` - Health check endpoint

## WebSocket Events

### Subscribing to Channels

Connect to WebSocket and send subscription messages:

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // Subscribe to activity channel
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'activity'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message);
};
```

### Available Channels

- **activity** - Activity timeline updates
- **logs** - New log entries
- **alerts** - Security alerts

### Broadcasting Events

Server automatically sends:

- `stats_update` - Every 10 seconds with current aggregated stats
- `activity_update` - Activity timeline updates
- `device_status_change` - When device goes online/offline
- `new_log` - When new logs are received
- `alert` - Critical security alerts

## AWS DynamoDB Tables

Expected table schemas:

### keyguard360-devices

```
Primary Key: device_id (String)

Attributes:
- device_id: String (PK)
- hostname: String
- os: String
- status: String (online/offline)
- last_seen: String (ISO timestamp)
- agent_version: String
- system_info: String (JSON)
```

### keyguard360-logs

```
Primary Key: log_id (String)
GSI: device_id-timestamp-index

Attributes:
- log_id: String (PK)
- device_id: String (GSI PK)
- timestamp: String (ISO timestamp, GSI SK)
- type: String
- data: String (JSON)
- count: Number (optional)
```

## Integration with Frontend

The frontend (React/TypeScript) can consume these APIs:

```typescript
// Fetch devices
const response = await fetch('http://localhost:3000/api/devices');
const { data: devices } = await response.json();

// Real-time updates via WebSocket
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'stats_update') {
    // Update dashboard with new stats
  }
};
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| AWS_ACCESS_KEY_ID | - | AWS access key |
| AWS_SECRET_ACCESS_KEY | - | AWS secret key |
| AWS_REGION | us-east-1 | AWS region |
| DYNAMODB_LOGS_TABLE | keyguard360-logs | DynamoDB logs table name |
| DYNAMODB_DEVICES_TABLE | keyguard360-devices | DynamoDB devices table name |
| S3_BUCKET | keyguard360-data | S3 bucket name |
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment (development/production) |
| FRONTEND_URL | http://localhost:5173 | CORS origin for frontend |

## Architecture

```
┌─────────────────────────┐
│  Agent Devices (Python) │
│  - Screenshots          │
│  - Keylogs              │
│  - System Info          │
└────────────┬────────────┘
             │
             ▼
      ┌──────────────┐
      │   AWS        │
      ├──────────────┤
      │ DynamoDB     │ (devices, logs)
      │ S3           │ (screenshots)
      │ SNS          │ (alerts)
      └──────┬───────┘
             │
             ▼
┌────────────────────────────────────┐
│   KeyGuard360 Backend API (Node)   │
├────────────────────────────────────┤
│ REST API (/api/devices, stats...)  │
│ WebSocket (real-time streaming)    │
│ Data aggregation & analytics       │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Frontend (React/TypeScript)       │
├────────────────────────────────────┤
│ Dashboard (real-time stats)        │
│ Device List (all connected devices)│
│ Activity Monitor                   │
│ Threat Analytics                   │
│ Compliance Reports                 │
└────────────────────────────────────┘
```

## Troubleshooting

### AWS Connection Issues

Ensure your AWS credentials are correct:
```bash
# Test AWS credentials
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

### DynamoDB Table Not Found

Make sure tables exist in AWS:
```bash
# Check tables in AWS CLI
aws dynamodb list-tables --region us-east-1
```

### CORS Errors

Verify FRONTEND_URL in `.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:5173  # Vite default
```

### WebSocket Connection Failed

Ensure the backend is running and WebSocket is enabled:
```bash
# Check if backend is running
curl http://localhost:3000/api/health
```

## Performance Tuning

For large deployments (1000+ devices):

1. **Add DynamoDB indexes** for faster queries
2. **Enable DynamoDB streams** for real-time updates
3. **Use caching** (Redis) for frequently accessed data
4. **Implement pagination** for large result sets
5. **Use Lambda functions** for asynchronous processing

## Security Notes

- Never commit `.env` file with credentials
- Use AWS IAM roles in production instead of access keys
- Enable API authentication (JWT/OAuth) for production
- Use HTTPS/WSS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all incoming data

## License

Proprietary - KeyGuard360
