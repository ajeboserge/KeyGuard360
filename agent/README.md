# KeyGuard360 Monitoring Agent

The Python3 client-side monitoring agent that runs on employee devices with their consent.

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd agent
pip install -r requirements.txt
```

Or using pip3:
```bash
pip3 install -r requirements.txt
```

### 2. Configure AWS Credentials

Edit `config.py` and add your AWS credentials:

```python
AWS_ACCESS_KEY = 'your-actual-access-key'
AWS_SECRET_KEY = 'your-actual-secret-key'
AWS_REGION = 'us-east-1'
S3_BUCKET = 'your-bucket-name'
```

**OR** set environment variables:

```bash
export AWS_ACCESS_KEY_ID='your-access-key'
export AWS_SECRET_ACCESS_KEY='your-secret-key'
export AWS_REGION='us-east-1'
export S3_BUCKET='keyguard360-data'
```

### 3. Setup AWS Resources

Before running the agent, create these AWS resources:

#### S3 Bucket
```bash
aws s3 mb s3://keyguard360-data --region us-east-1
```

#### DynamoDB Tables

**Logs Table:**
```bash
aws dynamodb create-table \
    --table-name keyguard360-logs \
    --attribute-definitions \
        AttributeName=log_id,AttributeType=S \
    --key-schema \
        AttributeName=log_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

**Devices Table:**
```bash
aws dynamodb create-table \
    --table-name keyguard360-devices \
    --attribute-definitions \
        AttributeName=device_id,AttributeType=S \
    --key-schema \
        AttributeName=device_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### SNS Topic (for alerts)
```bash
aws sns create-topic --name keyguard360-alerts --region us-east-1
```

Subscribe your email:
```bash
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:keyguard360-alerts \
    --protocol email \
    --notification-endpoint your-email@company.com
```

### 4. Run the Agent

```bash
python3 keyguard_agent.py
```

You'll see a consent notice. Press ENTER to start monitoring.

## 📁 Project Structure

```
agent/
├── keyguard_agent.py    # Main agent script
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── cache/              # Local cache (auto-created)
└── keyguard_agent.log  # Agent logs (auto-created)
```

## ⚙️ Configuration Options

Edit `config.py` to customize:

### Monitoring Features
```python
ENABLE_SCREENSHOTS = True      # Enable/disable screenshots
ENABLE_KEYLOGGING = True       # Enable/disable keylogging
SCREENSHOT_INTERVAL = 300      # Screenshot every 5 minutes
KEYLOG_BUFFER_SIZE = 100       # Upload after 100 keystrokes
```

### AWS Settings
```python
AWS_REGION = 'us-east-1'
S3_BUCKET = 'keyguard360-data'
DYNAMODB_LOGS_TABLE = 'keyguard360-logs'
DYNAMODB_DEVICES_TABLE = 'keyguard360-devices'
```

### Threat Detection
```python
THREAT_KEYWORDS = ['confidential', 'secret', 'password']
SUSPICIOUS_PROCESSES = ['wireshark', 'nmap']
```

## 🔍 What the Agent Does

### 1. **Screenshot Capture**
- Takes screenshots at configured intervals (default: 5 minutes)
- Uploads to S3: `s3://bucket/screenshots/{device_id}/`
- Automatically deletes local copies after upload

### 2. **Keyboard Monitoring**
- Logs keyboard activity with timestamps
- Buffers keystrokes (default: 100) before uploading
- Stores in DynamoDB for analysis

### 3. **System Information**
- Monitors CPU usage, memory, disk space
- Tracks running processes
- Updates device status every 60 seconds

### 4. **Threat Detection**
- Detects suspicious keywords in activity
- Identifies unauthorized applications
- Sends real-time alerts via SNS

### 5. **Data Upload**
- All data encrypted in transit (HTTPS/TLS)
- Stored securely in AWS
- Integrated with admin dashboard

## 🔐 Security & Compliance

### Employee Consent
The agent displays a consent notice on startup:
```
EMPLOYEE MONITORING CONSENT NOTICE
This device is monitored by KeyGuard360 for security purposes.
By using this device, you consent to monitoring of:
  - Screen activity (screenshots)
  - Keyboard activity (keylogs)
  - System performance metrics
```

### Data Privacy
- All AWS uploads use HTTPS/TLS encryption
- Data stored in AWS with proper IAM permissions
- Local cache is cleared after uploads (configurable)
- Logs rotate to prevent disk space issues

### Compliance Features
- Business hours tracking
- Application whitelisting/blacklisting
- Audit trail of all activities
- Configurable retention policies

## 🛠️ Troubleshooting

### "Invalid AWS credentials"
- Check your AWS credentials in `config.py`
- Or set environment variables
- Verify IAM user has correct permissions

### "S3 bucket not found"
- Create the bucket: `aws s3 mb s3://your-bucket-name`
- Ensure bucket name matches configuration
- Check AWS region

### "DynamoDB table not found"
- Create tables using AWS CLI commands above
- Verify table names match configuration
- Check AWS region

### "Permission denied" errors
Ensure your IAM user has these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:GetItem",
        "sns:Publish"
      ],
      "Resource": "*"
    }
  ]
}
```

### Screenshots not working
- **Windows**: Should work out of the box
- **macOS**: Grant Screen Recording permissions in System Preferences → Security & Privacy
- **Linux**: Install `scrot` or `gnome-screenshot`

### Keyboard logging not working
- **Windows**: Run as Administrator
- **macOS**: Grant Accessibility permissions in System Preferences
- **Linux**: User must be in `input` group

## 📊 Data Format

### Screenshots in S3
```
s3://bucket/screenshots/{device_id}/{device_id}_screenshot_20260108_143022.png
```

### Activity Logs in DynamoDB

**Device Status:**
```json
{
  "device_id": "device-abc123",
  "hostname": "Engineering-PC-47",
  "os": "Windows 11",
  "status": "online",
  "last_seen": "2026-01-08T14:30:22Z",
  "system_info": "{...}"
}
```

**Activity Logs:**
```json
{
  "log_id": "device-abc123_1704723022",
  "device_id": "device-abc123",
  "timestamp": "2026-01-08T14:30:22Z",
  "type": "keylog",
  "data": "[{key: 'a', timestamp: '...'}, ...]",
  "count": 100
}
```

## 🚦 Running as a Service

### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Task → Run whether user is logged in or not
3. Trigger: At startup
4. Action: Start program → `python.exe keyguard_agent.py`

### macOS (launchd)
Create `/Library/LaunchDaemons/com.keyguard360.agent.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.keyguard360.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/path/to/keyguard_agent.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

### Linux (systemd)
Create `/etc/systemd/system/keyguard360.service`:
```ini
[Unit]
Description=KeyGuard360 Monitoring Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/keyguard360/agent
ExecStart=/usr/bin/python3 /opt/keyguard360/agent/keyguard_agent.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable keyguard360
sudo systemctl start keyguard360
```

## 📈 Integration with Dashboard

The React dashboard automatically displays data from:
- **S3**: Screenshots loaded via presigned URLs
- **DynamoDB**: Device status, activity logs, keylogs
- **SNS**: Real-time alerts

To view data in the dashboard:
1. Run the agent on employee devices
2. Agent uploads data to AWS
3. Dashboard syncs with AWS using "Sync with AWS" button
4. View devices, screenshots, activity in real-time

## ⚠️ Important Notes

### Legal & Ethical Considerations
- **Employee consent is required** in most jurisdictions
- Display monitoring notice on device startup
- Comply with local privacy laws (GDPR, CCPA, etc.)
- Store only business-related data
- Implement data retention policies
- Provide employees access to their data

### Security Best Practices
- Never hardcode AWS credentials in production
- Use IAM roles and least privilege access
- Rotate credentials regularly
- Enable CloudTrail for audit logging
- Encrypt data at rest in S3
- Use VPC endpoints for AWS services

### Resource Usage
- Screenshots: ~500KB - 2MB each (every 5 min = ~300MB/day)
- Keylogs: ~1KB per 100 keystrokes
- System info: ~2KB per update (every 60s)
- Estimated: ~500MB - 1GB per device per day

## 📞 Support

For issues or questions:
1. Check logs: `keyguard_agent.log`
2. Verify AWS resources are created
3. Test AWS credentials: `python3 config.py`
4. Review CloudWatch logs for Lambda/API Gateway errors

## 📄 License

This is enterprise monitoring software. Use responsibly and ethically.
Ensure compliance with all applicable laws and regulations.
