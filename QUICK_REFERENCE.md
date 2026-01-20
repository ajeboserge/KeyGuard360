# Quick Reference - KeyGuard360 Multi-Device Monitoring

## System Overview
```
Devices (Agents) → AWS (DynamoDB, S3) → Backend API → Frontend Dashboard
```

## Quick Start Commands

### 1. Setup AWS Infrastructure (One-time)
```bash
# Create DynamoDB tables and S3 bucket
bash setup-aws.sh
```

### 2. Start Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
# Backend running on http://localhost:3000
```

### 3. Start Agent on Device (Terminal 2)
```bash
cd agent
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python keyguard_agent.py
```

### 4. Start Frontend (Terminal 3)
```bash
npm run dev
# Frontend running on http://localhost:5173
```

## Configuration Files

### Backend Environment (backend/.env)
```env
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=us-east-1
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Agent Configuration (agent/config.py)
```python
AWS_ACCESS_KEY = "your_key_here"
AWS_SECRET_KEY = "your_secret_here"
ENABLE_SCREENSHOTS = True
ENABLE_KEYLOGGING = True
SCREENSHOT_INTERVAL = 300  # seconds
```

### Frontend Configuration (src/.env or inline)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/:id` | Get device details |
| GET | `/api/devices/:id/stats` | Device performance |
| GET | `/api/devices/:id/logs?type=screenshot&limit=20` | Device logs |
| GET | `/api/stats` | Aggregated stats |
| GET | `/api/activity-timeline?hours=24` | Activity timeline |
| GET | `/api/alerts?limit=50` | Recent alerts |
| GET | `/api/health` | Health check |

## React Hooks (Frontend)

```typescript
// Fetch all devices
const { data: devices, loading, error } = useDevices();

// Fetch single device
const { data: device } = useDevice('device-abc123');

// Get device stats
const { data: stats } = useDeviceStats('device-abc123');

// Get device logs
const { data: logs } = useDeviceLogs('device-abc123', {
  type: 'screenshot',
  limit: 20
});

// Get aggregated stats
const { data: stats } = useAggregatedStats();

// Get activity timeline
const { data: timeline } = useActivityTimeline(24);

// Get alerts
const { data: alerts } = useAlerts(50);

// Real-time WebSocket
const { connected, subscribe } = useWebSocket();
subscribe('activity');

// Combine API + WebSocket
const { data, wsConnected } = useRealtimeData(
  '/stats',
  ['stats_update']
);
```

## Common Tasks

### Check if Backend is Running
```bash
curl http://localhost:3000/api/health
```

### View Devices in Database
```bash
aws dynamodb scan --table-name keyguard360-devices --region us-east-1
```

### View Logs in Database
```bash
aws dynamodb scan --table-name keyguard360-logs --region us-east-1
```

### View Screenshots in S3
```bash
aws s3 ls s3://keyguard360-data/screenshots/ --recursive
```

### Check Agent Logs
```bash
tail -f agent/keyguard_agent.log
```

### Check Backend Logs (Development)
```bash
# Already showing in npm run dev terminal
```

### Restart Everything
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd agent && source venv/bin/activate && python keyguard_agent.py

# Terminal 3
npm run dev
```

## Database Schemas

### Devices Table
```json
{
  "device_id": "device-abc123",
  "hostname": "DESKTOP-USER",
  "os": "Windows 10 19045",
  "status": "online",
  "last_seen": "2024-01-20T12:30:45.123Z",
  "agent_version": "1.0.0",
  "system_info": "{\"cpu_usage\": 25, \"memory_percent\": 60, ...}"
}
```

### Logs Table
```json
{
  "log_id": "device-abc123_1234567890",
  "device_id": "device-abc123",
  "timestamp": "2024-01-20T12:30:45.123Z",
  "type": "screenshot",
  "data": "{...}",
  "count": 1
}
```

## Troubleshooting Checklist

### Agents not uploading?
- [ ] AWS credentials correct in config.py
- [ ] Agent logs show no errors
- [ ] Network connection to AWS working
- [ ] DynamoDB tables exist in AWS

### Backend not responding?
- [ ] Backend running (`npm run dev`)
- [ ] AWS credentials in .env correct
- [ ] DynamoDB tables accessible
- [ ] Port 3000 not blocked by firewall

### Dashboard showing no data?
- [ ] Backend running and healthy
- [ ] Frontend `.env` has correct API URL
- [ ] At least one agent running
- [ ] No CORS errors in browser console

### WebSocket not working?
- [ ] Backend running
- [ ] Port 3000 accessible
- [ ] No firewall blocking WebSocket
- [ ] Browser supports WebSocket (all modern browsers do)

## Performance Tips

### For 100+ Devices
1. Increase DynamoDB capacity
2. Add caching layer (Redis)
3. Implement pagination in API
4. Monitor CloudWatch metrics

### Optimize API Responses
```typescript
// Add limit parameter
const { data } = useDeviceLogs('device-123', { limit: 50 });

// Use specific time ranges
const { data } = useActivityTimeline(24);  // 24 hours instead of full history
```

## Production Deployment

### AWS EC2
```bash
# SSH to instance
ssh -i key.pem ec2-user@instance-ip

# Install dependencies
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone <repo-url>
cd backend && npm install && npm run build

# Run with PM2
npm install -g pm2
pm2 start dist/server.js
pm2 startup
pm2 save
```

### Docker
```bash
cd backend
docker build -t keyguard360-api .
docker run -d \
  -e AWS_ACCESS_KEY_ID=xxx \
  -e AWS_SECRET_ACCESS_KEY=xxx \
  -p 3000:3000 \
  keyguard360-api
```

### Heroku
```bash
heroku login
heroku create myapp-name
git push heroku main
```

## Security Checklist

- [ ] AWS credentials in environment variables (never hardcoded)
- [ ] HTTPS/WSS enabled in production
- [ ] API authentication implemented (JWT/OAuth)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] S3 encryption enabled
- [ ] CloudTrail logging enabled
- [ ] IAM roles with minimal permissions

## Resources

- Backend API: `backend/README.md`
- Full Setup Guide: `DEPLOYMENT_GUIDE.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- Agent Docs: `agent/README.md`

## Getting Help

1. Check error logs:
   - Agent: `agent/keyguard_agent.log`
   - Backend: console output when running `npm run dev`
   - Frontend: browser console (F12)

2. Test connectivity:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Verify AWS:
   ```bash
   aws dynamodb list-tables --region us-east-1
   ```

4. Check table contents:
   ```bash
   aws dynamodb scan --table-name keyguard360-devices
   ```

---

**Last Updated**: January 20, 2024
**Version**: 1.0.0
