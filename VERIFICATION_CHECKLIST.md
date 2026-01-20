# Verification Checklist - Multi-Device Setup

Use this checklist to verify your KeyGuard360 multi-device system is working correctly.

## Pre-Setup Checks

- [ ] Node.js 18+ installed (`node -v`)
- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws sts get-caller-identity`)
- [ ] Git installed (`git --version`)

## Backend Setup Verification

### 1. Backend Files Created
```bash
cd backend
ls -la
```
Verify you see:
- [ ] `src/` directory
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `.env.example`
- [ ] `README.md`

### 2. Dependencies Installed
```bash
cd backend
npm list | head -20
```
Verify you see:
- [ ] `express`
- [ ] `aws-sdk`
- [ ] `ws` (WebSocket)
- [ ] `cors`
- [ ] `dotenv`

### 3. Environment Variables
```bash
cat backend/.env
```
Verify you see:
- [ ] `AWS_ACCESS_KEY_ID` set
- [ ] `AWS_SECRET_ACCESS_KEY` set
- [ ] `AWS_REGION` set
- [ ] `PORT=3000` (or your chosen port)

### 4. Backend Runs Successfully
```bash
cd backend
npm run dev
```
Verify output includes:
- [ ] `Server running on http://localhost:3000`
- [ ] `WebSocket running on ws://localhost:3000`
- [ ] No error messages
- [ ] "Connected clients: 0" shown

## AWS Setup Verification

### 1. DynamoDB Tables Exist
```bash
aws dynamodb list-tables --region us-east-1
```
Verify output includes:
- [ ] `keyguard360-devices`
- [ ] `keyguard360-logs`

### 2. S3 Bucket Exists
```bash
aws s3 ls | grep keyguard360
```
Verify you see:
- [ ] `keyguard360-data` bucket listed

### 3. IAM User Created (Optional)
```bash
aws iam list-users | grep keyguard360
```
Verify you see:
- [ ] `keyguard360-agent` user listed

## API Endpoint Verification

With backend running, test each endpoint:

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```
Expected response:
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2024-01-20T..."
}
```
- [ ] Returns status 200
- [ ] `success: true`

### 2. Get Devices (empty initially)
```bash
curl http://localhost:3000/api/devices
```
Expected response:
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```
- [ ] Returns status 200
- [ ] Empty data array (until agents connect)

### 3. Get Stats (empty initially)
```bash
curl http://localhost:3000/api/stats
```
Expected response:
```json
{
  "success": true,
  "data": {
    "total_devices": 0,
    "active_devices": 0,
    "offline_devices": 0,
    "avg_cpu_usage": 0,
    "avg_memory_usage": 0,
    "avg_disk_usage": 0
  }
}
```
- [ ] Returns status 200
- [ ] Shows zero devices initially

### 4. Get Activity Timeline
```bash
curl "http://localhost:3000/api/activity-timeline?hours=24"
```
Expected response:
```json
{
  "success": true,
  "data": []
}
```
- [ ] Returns status 200
- [ ] Empty timeline initially

## Frontend Setup Verification

### 1. Environment Variables
Check if `src/.env` exists or set in code:
```bash
grep -r "REACT_APP_API_URL" src/
```
Verify:
- [ ] API URL points to backend (`http://localhost:3000/api`)
- [ ] WebSocket URL correct (`ws://localhost:3000`)

### 2. Hooks Exist
```bash
ls -la src/hooks/
```
Verify you see:
- [ ] `useApi.ts` file exists

### 3. Dashboard Component Updated
```bash
grep -n "useAggregatedStats\|useActivityTimeline\|useAlerts" src/app/components/Dashboard.tsx
```
Verify you see:
- [ ] `useAggregatedStats` imported/used
- [ ] `useActivityTimeline` imported/used
- [ ] `useAlerts` imported/used

### 4. Frontend Runs
```bash
npm run dev
```
Verify output includes:
- [ ] Vite server started
- [ ] Frontend accessible at http://localhost:5173
- [ ] No CORS errors in browser console

## Agent Setup Verification

### 1. Agent Files Exist
```bash
cd agent
ls -la
```
Verify you see:
- [ ] `keyguard_agent.py`
- [ ] `config.py`
- [ ] `requirements.txt`
- [ ] `test_connection.py`

### 2. Virtual Environment Created
```bash
cd agent
ls -la venv/
```
Verify you see:
- [ ] `bin/` or `Scripts/` directory
- [ ] `pyvenv.cfg` file

### 3. Dependencies Installed
```bash
cd agent
source venv/bin/activate
pip list | grep -E "boto3|pillow|pynput|psutil"
```
Verify you see:
- [ ] `boto3` installed
- [ ] `Pillow` installed
- [ ] `pynput` installed
- [ ] `psutil` installed

### 4. Agent Configuration
```bash
cd agent
grep "AWS_ACCESS_KEY" config.py
```
Verify:
- [ ] AWS credentials configured (not "YOUR_AWS_...")
- [ ] DynamoDB table names correct
- [ ] S3 bucket name correct

### 5. Test Agent Connection (Optional)
```bash
cd agent
source venv/bin/activate
python test_connection.py
```
Expected output:
- [ ] "Successfully connected to AWS"
- [ ] Tables listed
- [ ] No connection errors

## System Integration Verification

### 1. Start All Services (in separate terminals)

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```
Verify:
- [ ] "Server running on http://localhost:3000"
- [ ] No errors in output
- [ ] Listening for connections

**Terminal 2 - Agent (on any device):**
```bash
cd agent
source venv/bin/activate
python keyguard_agent.py
```
Verify:
- [ ] "Agent initialized for device: device-..."
- [ ] "Screenshot uploaded:" messages (every 5 minutes)
- [ ] No error messages in log

**Terminal 3 - Frontend:**
```bash
npm run dev
```
Verify:
- [ ] Frontend accessible at http://localhost:5173
- [ ] Dashboard loads without errors

### 2. Check Data Flow

After agent runs for ~1 minute, verify data appears:

**Backend - Check devices:**
```bash
curl http://localhost:3000/api/devices | jq
```
Should show:
```json
{
  "success": true,
  "data": [
    {
      "device_id": "device-...",
      "hostname": "...",
      "os": "...",
      "status": "online",
      "last_seen": "2024-01-20T...",
      "agent_version": "1.0.0"
    }
  ],
  "count": 1
}
```
- [ ] Device appears in list
- [ ] Status is "online"
- [ ] Last seen time is recent

**Backend - Check stats:**
```bash
curl http://localhost:3000/api/stats | jq
```
Should show:
```json
{
  "success": true,
  "data": {
    "total_devices": 1,
    "active_devices": 1,
    "offline_devices": 0,
    "avg_cpu_usage": 45,
    "avg_memory_usage": 62,
    "avg_disk_usage": 55
  }
}
```
- [ ] `total_devices: 1` (or more)
- [ ] `active_devices: 1` (or more)
- [ ] CPU/memory/disk usage > 0

**AWS - Check DynamoDB:**
```bash
aws dynamodb scan --table-name keyguard360-devices | jq '.Items | length'
```
Should output:
- [ ] `1` or more items

**AWS - Check S3:**
```bash
aws s3 ls s3://keyguard360-data/screenshots/
```
Should show:
- [ ] Device folder(s) created
- [ ] Screenshot files being uploaded

### 3. Check Frontend Data

Visit http://localhost:5173 in browser:

Dashboard page should show:
- [ ] "Total Devices: 1" (or your device count)
- [ ] "Active Devices: 1"
- [ ] Activity timeline chart with data
- [ ] Recent security events listed (if any)

Open browser DevTools (F12):
- [ ] No CORS errors in console
- [ ] No 404 errors for API calls
- [ ] Network tab shows successful requests to backend

### 4. WebSocket Verification

In browser console, test WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'subscribe', channel: 'activity' }));
```

Verify:
- [ ] "Connected" appears in console
- [ ] Receives messages (should see stats_update every 10 seconds)
- [ ] No errors in console

## Monitoring & Logs

### 1. Agent Logs
```bash
cd agent
tail -f keyguard_agent.log
```
Should show:
- [ ] "Agent initialized for device"
- [ ] "Screenshot uploaded" messages
- [ ] Status updates
- [ ] No error messages

### 2. Backend Logs
In Terminal 1 where backend runs:
- [ ] "GET /api/devices" requests logged
- [ ] "GET /api/stats" requests logged
- [ ] WebSocket "Client connected" messages
- [ ] No 500 errors

### 3. Browser Console
Press F12 in browser:
- [ ] No red error messages
- [ ] Network requests show 200/201 status codes
- [ ] WebSocket shows connected/messages

## Performance Verification

### 1. API Response Times
```bash
time curl http://localhost:3000/api/devices > /dev/null
time curl http://localhost:3000/api/stats > /dev/null
time curl http://localhost:3000/api/activity-timeline > /dev/null
```
Expected:
- [ ] All requests < 200ms
- [ ] Most requests < 100ms

### 2. Dashboard Load Time
- [ ] Dashboard loads in < 2 seconds
- [ ] No excessive network requests
- [ ] Smooth interactions

### 3. Memory Usage
```bash
# On device running agent
top -b -n 1 | grep python
```
Verify:
- [ ] Python process < 500MB RAM
- [ ] CPU usage < 30%

## Scalability Verification (Optional)

### Deploy to Multiple Devices

1. Copy agent files to another device
2. Configure with unique AWS credentials
3. Run agent on second device
4. Verify in backend:

```bash
curl http://localhost:3000/api/devices | jq '.count'
```
Should output:
- [ ] `2` (or higher)

Verify Dashboard shows:
- [ ] "Total Devices: 2" (updated)
- [ ] Both devices in device list
- [ ] Separate metrics for each device

## Final Checklist

- [ ] All 3 services running (Backend, Frontend, Agent)
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Device data appears in backend
- [ ] Device metrics appear in frontend dashboard
- [ ] WebSocket connection established
- [ ] Real-time updates flowing
- [ ] Logs show normal operation
- [ ] No critical errors anywhere
- [ ] Performance is acceptable

---

## Troubleshooting Guide

If any check fails, see:

1. **Backend won't start**
   - Verify Node.js 18+ installed
   - Check `.env` file exists and is readable
   - Verify AWS credentials are valid
   - Check port 3000 is not in use

2. **Agent won't connect to AWS**
   - Verify AWS credentials in `config.py`
   - Check network connectivity to AWS
   - Verify DynamoDB tables exist
   - Check IAM permissions

3. **Dashboard shows no data**
   - Verify agent is running
   - Check `curl http://localhost:3000/api/devices` returns data
   - Verify frontend `.env` points to correct backend URL
   - Check browser console for CORS errors

4. **WebSocket not connecting**
   - Verify backend is running
   - Check firewall allows WebSocket on port 3000
   - Test in browser: `new WebSocket('ws://localhost:3000')`

5. **Slow performance**
   - Check network connectivity
   - Monitor DynamoDB throttling
   - Increase backend instance size
   - Add caching (Redis)

---

## Success Indicators

You'll know the system is working when:

✅ Agent runs continuously without errors
✅ Backend receives and logs API requests
✅ Frontend dashboard shows live device metrics
✅ WebSocket delivers real-time updates
✅ Screenshots and logs appear in S3 and DynamoDB
✅ Adding more devices auto-updates dashboard
✅ All performance metrics are within acceptable ranges

---

**Verification Complete!** 🎉

Your KeyGuard360 multi-device monitoring system is ready for production use.
