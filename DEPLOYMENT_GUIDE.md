# Multi-Device Deployment Integration Guide

This guide explains how to use the new backend API to run KeyGuard360 agents on multiple devices and display all data on the centralized dashboard.

## Architecture Overview

```
Multiple Devices (Windows/Mac/Linux)
├── Device 1 (Agent running)
├── Device 2 (Agent running)
├── Device 3 (Agent running)
└── Device N (Agent running)
         ↓
         ↓ (Upload data)
         ↓
    AWS Services
    ├── DynamoDB (devices, logs tables)
    ├── S3 (screenshots bucket)
    └── SNS (alerts topic)
         ↓
         ↓ (Query data)
         ↓
Backend API (Node.js)
├── REST Endpoints (/api/devices, /api/logs, /api/stats)
└── WebSocket (real-time updates)
         ↓
         ↓ (Display data)
         ↓
Dashboard (React/TypeScript)
├── Device metrics
├── Activity timeline
├── Security alerts
└── Compliance reports
```

## Step 1: Set Up AWS Infrastructure

### Create DynamoDB Tables

Run these AWS CLI commands to create the required tables:

```bash
# Create devices table
aws dynamodb create-table \
  --table-name keyguard360-devices \
  --attribute-definitions \
    AttributeName=device_id,AttributeType=S \
  --key-schema \
    AttributeName=device_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create logs table with GSI for efficient querying
aws dynamodb create-table \
  --table-name keyguard360-logs \
  --attribute-definitions \
    AttributeName=log_id,AttributeType=S \
    AttributeName=device_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=log_id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=device_id-timestamp-index,\
    KeySchema=[\
      {AttributeName=device_id,KeyType=HASH},\
      {AttributeName=timestamp,KeyType=RANGE}\
    ],\
    Projection={ProjectionType=ALL},\
    ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create S3 bucket for screenshots
aws s3 mb s3://keyguard360-data --region us-east-1
```

### Create IAM User (for agents)

```bash
# Create IAM user with programmatic access
aws iam create-user --user-name keyguard360-agent

# Attach policy for DynamoDB and S3 access
aws iam attach-user-policy \
  --user-name keyguard360-agent \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-user-policy \
  --user-name keyguard360-agent \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Create access keys
aws iam create-access-key --user-name keyguard360-agent
```

## Step 2: Configure Agent on Each Device

### Windows/Mac/Linux Setup

1. **Clone the repository** on each device:
```bash
git clone <repo-url> keyguard360
cd keyguard360/agent
```

2. **Install Python dependencies**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure agent credentials** in `agent/config.py`:
```python
# Replace with actual credentials from IAM user
AWS_ACCESS_KEY = "your-agent-iam-access-key"
AWS_SECRET_KEY = "your-agent-iam-secret-key"
AWS_REGION = "us-east-1"
```

Or set environment variables:
```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-1"
```

4. **Run the agent**:
```bash
python keyguard_agent.py
```

### Configure Multiple Devices

Each agent will generate a unique `device_id` based on:
- Hostname
- MAC address

This ensures no conflicts across multiple devices. All agents upload to the same AWS tables:
- Devices table: Tracks online/offline status
- Logs table: Stores activity, screenshots, keylogs for each device

## Step 3: Set Up Backend API Server

### Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Create `.env` file**:
```bash
cp .env.example .env
```

3. **Configure `.env` with your AWS credentials**:
```env
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
DYNAMODB_LOGS_TABLE=keyguard360-logs
DYNAMODB_DEVICES_TABLE=keyguard360-devices
S3_BUCKET=keyguard360-data
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Running the Backend

**Development**:
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## Step 4: Connect Frontend to Backend

### Environment Variables

Create `src/.env` in the frontend:
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

Or for production:
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_WS_URL=wss://api.yourdomain.com
```

### Using the API Hooks

The frontend already includes React hooks for data fetching:

```typescript
import { 
  useDevices, 
  useAggregatedStats, 
  useActivityTimeline,
  useAlerts,
  useWebSocket 
} from './hooks/useApi';

function MyComponent() {
  // Fetch all devices (auto-refetch every 30s)
  const { data: devices, loading } = useDevices();

  // Fetch aggregated stats (auto-refetch every 10s)
  const { data: stats } = useAggregatedStats();

  // Real-time WebSocket updates
  const { connected, subscribe } = useWebSocket();

  useEffect(() => {
    if (connected) {
      subscribe('activity'); // Subscribe to activity channel
    }
  }, [connected, subscribe]);

  return (
    <div>
      {loading ? 'Loading...' : `Found ${devices?.length || 0} devices`}
    </div>
  );
}
```

## Step 5: Deploy (Optional)

### Backend Deployment

#### AWS EC2

```bash
# Launch EC2 instance (t3.small recommended)
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repo and setup
git clone <repo-url>
cd backend
npm install
npm run build

# Run with PM2 for persistence
sudo npm install -g pm2
pm2 start dist/server.js --name "keyguard360-api"
pm2 startup
pm2 save
```

#### Docker

```bash
cd backend

# Create Dockerfile
cat > Dockerfile <<EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
EOF

# Build and run
docker build -t keyguard360-api .
docker run -d \
  -e AWS_ACCESS_KEY_ID=xxx \
  -e AWS_SECRET_ACCESS_KEY=xxx \
  -e AWS_REGION=us-east-1 \
  -p 3000:3000 \
  keyguard360-api
```

#### Heroku

```bash
# Create Procfile
echo "web: npm run build && node dist/server.js" > Procfile

# Deploy
heroku login
heroku create keyguard360-api
git push heroku main
```

### Frontend Deployment

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel
# Follow prompts to connect GitHub and deploy
```

#### GitHub Pages

```bash
npm run build
# Deploy dist folder to GitHub Pages
```

## Step 6: Testing

### Test Agent

```bash
# Test agent connection
cd agent
python test_connection.py
```

### Test Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Get devices
curl http://localhost:3000/api/devices

# Get stats
curl http://localhost:3000/api/stats
```

### Test WebSocket

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'subscribe', channel: 'activity' }));
};

ws.onmessage = (e) => {
  console.log('Message:', JSON.parse(e.data));
};
```

## Monitoring

### Check Agent Logs

```bash
cd agent
tail -f keyguard_agent.log
```

### Check Backend Logs

```bash
# Development
npm run dev  # Logs to console

# Production with PM2
pm2 logs keyguard360-api
```

### Monitor AWS Resources

```bash
# View items in DynamoDB
aws dynamodb scan --table-name keyguard360-devices --region us-east-1

# View S3 screenshots
aws s3 ls s3://keyguard360-data/screenshots/ --recursive --region us-east-1
```

## Troubleshooting

### Agents not uploading data?

1. Check agent logs: `tail keyguard_agent.log`
2. Verify AWS credentials in config.py
3. Verify DynamoDB tables exist
4. Check network connectivity to AWS

### Backend API returns 500 errors?

1. Verify `.env` file has correct AWS credentials
2. Check backend logs: `npm run dev`
3. Verify DynamoDB tables exist and are accessible
4. Check IAM permissions

### Dashboard shows no data?

1. Verify backend is running: `curl http://localhost:3000/api/health`
2. Verify frontend `.env` has correct API URL
3. Check browser console for CORS errors
4. Verify agents are uploading (check S3 bucket and DynamoDB)

### WebSocket not connecting?

1. Ensure backend is running
2. Check firewall allows WebSocket connections
3. Verify `REACT_APP_WS_URL` in frontend `.env`
4. Check browser console for connection errors

## Performance Optimization

For 1000+ devices:

1. **Add DynamoDB indexes** for faster queries
2. **Enable pagination** in API responses
3. **Use caching** (Redis) for frequent queries
4. **Increase DynamoDB capacity** as needed
5. **Monitor CloudWatch metrics** for bottlenecks

## Security Best Practices

1. **Use environment variables** for credentials (never hardcode)
2. **Enable AWS MFA** on main account
3. **Use separate IAM roles** for agents and API server
4. **Enable CloudTrail** for audit logging
5. **Use HTTPS/WSS** in production
6. **Implement API authentication** (JWT/OAuth)
7. **Enable S3 encryption** for screenshots
8. **Restrict DynamoDB access** with IAM policies

## Next Steps

1. Deploy agents to 5-10 test devices
2. Monitor logs and DynamoDB for issues
3. Scale up to full device fleet
4. Implement additional features (threat detection, compliance scoring)
5. Set up alerting and notifications

## Support

For issues or questions:
- Check logs: Agent logs and backend logs
- Test connectivity: `curl` API endpoints
- Verify AWS credentials and permissions
- Check GitHub issues for similar problems
