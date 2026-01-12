# KeyGuard360 - Import/Export Guide

Complete guide for exporting device data from AWS and importing it into the dashboard.

---

## 📤 Exporting Data (Python Agent)

The Python agent includes an export utility that downloads device data from AWS and saves it as JSON files.

### Export All Devices

```bash
cd agent
python3 export_data.py --all
```

This creates an `exports/` folder with:
- Individual JSON files for each device (`device-abc123.json`)
- An `index.json` file listing all exported devices

### Export Specific Device

```bash
python3 export_data.py --device-id device-abc123
```

### Custom Output Directory

```bash
python3 export_data.py --all --output /path/to/backup
```

### What Gets Exported

Each device export file contains:

```json
{
  "device_id": "device-abc123",
  "export_timestamp": "2026-01-08T14:30:22Z",
  "device_info": {
    "device_id": "device-abc123",
    "hostname": "Engineering-PC-47",
    "os": "Windows 11",
    "status": "online",
    "last_seen": "2026-01-08T14:30:22Z",
    "agent_version": "1.0.0",
    "system_info": "{...}"
  },
  "logs": [
    {
      "log_id": "device-abc123_1704723022000",
      "device_id": "device-abc123",
      "timestamp": "2026-01-08T14:30:22Z",
      "type": "keylog",
      "data": "[...]",
      "count": 100
    }
  ],
  "screenshots": [
    {
      "key": "screenshots/device-abc123/screenshot_20260108_143022.png",
      "size": 524288,
      "last_modified": "2026-01-08T14:30:22Z",
      "url": "s3://bucket/screenshots/device-abc123/screenshot.png"
    }
  ],
  "stats": {
    "total_logs": 245,
    "total_screenshots": 48
  }
}
```

---

## 📥 Importing Data (React Dashboard)

The dashboard includes a **Bulk Import** feature that reads exported JSON files.

### Access Bulk Import

1. Open the KeyGuard360 dashboard in your browser
2. Click **"Bulk Import"** in the sidebar
3. Choose import method:

### Method 1: Import Entire Folder

1. Click **"Select Folder"**
2. Navigate to your `exports/` directory
3. Select the folder
4. All JSON files will be imported automatically

**Note:** Modern browsers support folder selection via the File System Access API.

### Method 2: Import Individual Files

1. Click **"Select Files"**
2. Navigate to your `exports/` directory
3. Select one or more `.json` files (Ctrl/Cmd + Click for multiple)
4. Click "Open"

### What Happens During Import

- ✅ Validates JSON structure
- ✅ Extracts device information
- ✅ Counts logs and screenshots
- ✅ Stores data in browser localStorage
- ✅ Displays import results
- ✅ Updates device list automatically

### After Import

Imported devices will appear in:
- **Devices** page - Listed with all other devices
- **Activity Monitor** - Logs are available for viewing
- **Dashboard** - Statistics include imported data

---

## 🔄 Use Cases

### 1. Backup and Restore

**Export (Backup):**
```bash
# Export all devices to backup folder
python3 export_data.py --all --output ~/backups/keyguard/$(date +%Y%m%d)
```

**Import (Restore):**
1. Open dashboard
2. Go to Bulk Import
3. Select backup folder
4. All devices restored

### 2. Migrate Between Environments

**Development → Production:**
```bash
# Export from dev environment
AWS_PROFILE=dev python3 export_data.py --all --output ./dev_export

# Import to production via dashboard
# Upload to production AWS or import directly to dashboard
```

### 3. Testing & Demo

**Create Test Data:**
```bash
# Export sample devices
python3 export_data.py --device-id device-sample123 --output ./demo_data
```

**Use in Demo:**
1. Import sample data via dashboard
2. Show features without connecting to AWS
3. Clear imported data when done

### 4. Compliance Reporting

**Monthly Export:**
```bash
# Export devices for compliance audit
python3 export_data.py --all --output /compliance/reports/2026-01
```

Use exported JSON for:
- Audit trails
- Compliance reports
- Historical analysis
- Data retention compliance

### 5. Offline Analysis

**Export for Analysis:**
```bash
# Export all device data
python3 export_data.py --all --output ./analysis_data
```

Analyze with:
- Python scripts
- Data science tools (pandas, numpy)
- Custom reporting tools
- Business intelligence platforms

---

## 📊 Export File Structure

```
exports/
├── index.json                          # Index of all devices
├── device-abc123.json                  # Device 1 data
├── device-def456.json                  # Device 2 data
├── device-ghi789.json                  # Device 3 data
└── ...
```

**index.json:**
```json
{
  "export_timestamp": "2026-01-08T14:30:22Z",
  "total_devices": 3,
  "devices": [
    {
      "device_id": "device-abc123",
      "hostname": "Engineering-PC-47",
      "os": "Windows 11",
      "status": "online",
      "last_seen": "2026-01-08T14:30:22Z",
      "filename": "device-abc123.json"
    }
  ]
}
```

---

## 🛠️ Advanced Usage

### Automated Backups

**Cron Job (Linux/Mac):**
```bash
# Add to crontab: Daily backup at 2 AM
0 2 * * * cd /opt/keyguard360/agent && python3 export_data.py --all --output /backups/keyguard/$(date +\%Y\%m\%d)
```

**Task Scheduler (Windows):**
```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "python3" -Argument "C:\keyguard360\agent\export_data.py --all --output C:\Backups\KeyGuard\$(Get-Date -Format 'yyyyMMdd')"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "KeyGuard360 Backup" -Action $action -Trigger $trigger
```

### Filter Exports by Date

Modify `export_data.py` to filter by date:

```python
# Export devices active in last 7 days
from datetime import datetime, timedelta
cutoff_date = (datetime.utcnow() - timedelta(days=7)).isoformat()

response = devices_table.scan(
    FilterExpression='last_seen > :cutoff',
    ExpressionAttributeValues={':cutoff': cutoff_date}
)
```

### Merge Multiple Exports

**Python Script:**
```python
import json
import glob

# Read all device files
devices = []
for file in glob.glob('exports/*.json'):
    if file.endswith('index.json'):
        continue
    with open(file) as f:
        devices.append(json.load(f))

# Merge into single file
with open('merged_devices.json', 'w') as f:
    json.dump(devices, f, indent=2)
```

---

## 🔒 Security Considerations

### Exported Data Contains Sensitive Information

**What's Included:**
- ✅ Device information
- ✅ System metrics
- ✅ Activity logs
- ✅ **Keylog data** (sensitive!)
- ✅ Screenshot metadata
- ✅ User activity

### Best Practices

1. **Encrypt Exports:**
```bash
# Encrypt with GPG
gpg --encrypt --recipient admin@company.com exports/device-abc123.json

# Decrypt
gpg --decrypt device-abc123.json.gpg > device-abc123.json
```

2. **Secure Storage:**
- Store exports on encrypted drives
- Use secure network shares
- Implement access controls
- Enable audit logging

3. **Data Retention:**
- Delete old exports per policy
- Comply with GDPR/CCPA requirements
- Document retention schedule

4. **Access Control:**
- Limit who can export data
- Log all export operations
- Require multi-factor authentication

---

## 🧪 Testing Import/Export

### Test Export

```bash
# 1. Run agent to generate test data
python3 keyguard_agent.py
# (Let it run for a few minutes to capture data)

# 2. Stop agent (Ctrl+C)

# 3. Export the data
python3 export_data.py --all --output ./test_export

# 4. Verify files
ls -lh test_export/
cat test_export/index.json
```

### Test Import

```bash
# 1. Start React dashboard
npm run dev

# 2. Open browser: http://localhost:5173
# 3. Login (admin / admin123)
# 4. Navigate to "Bulk Import"
# 5. Click "Select Folder"
# 6. Choose test_export/ folder
# 7. Verify import results
# 8. Check "Devices" page for imported data
```

### Verify Import

```javascript
// Open browser console
// Check localStorage
Object.keys(localStorage)
  .filter(k => k.startsWith('device_'))
  .forEach(k => console.log(k, JSON.parse(localStorage.getItem(k))));
```

---

## 🚨 Troubleshooting

### Export Issues

**Problem:** "AWS credentials not found"
```bash
# Solution: Set credentials
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
```

**Problem:** "DynamoDB table not found"
```bash
# Solution: Verify table name in config.py
python3 -c "from config import Config; print(Config().DYNAMODB_DEVICES_TABLE)"
```

**Problem:** "No devices exported"
```bash
# Solution: Check if devices exist in DynamoDB
aws dynamodb scan --table-name keyguard360-devices
```

### Import Issues

**Problem:** "Invalid JSON format"
- Solution: Verify JSON structure matches expected format
- Download sample format from dashboard
- Check for syntax errors with `jsonlint`

**Problem:** "Import shows 0 devices"
- Solution: Ensure you're selecting JSON files, not folders
- Check browser console for errors (F12)
- Verify files contain `device_id` field

**Problem:** "Imported data doesn't appear in Devices page"
- Solution: Refresh the page
- Clear browser cache
- Check that localStorage isn't full

---

## 📚 API Reference

### Export Script Arguments

```
python3 export_data.py [OPTIONS]

OPTIONS:
  --all               Export all devices
  --device-id ID      Export specific device by ID
  --output PATH       Output directory (default: ./exports)
  --help             Show help message
```

### Export Data Structure

```typescript
interface DeviceExport {
  device_id: string;
  export_timestamp: string;
  device_info: {
    device_id: string;
    hostname: string;
    os: string;
    status: 'online' | 'offline';
    last_seen: string;
    agent_version: string;
    system_info: string; // JSON string
  };
  logs: Array<{
    log_id: string;
    device_id: string;
    timestamp: string;
    type: string;
    data: string;
  }>;
  screenshots: Array<{
    key: string;
    size: number;
    last_modified: string;
    url: string;
  }>;
  stats: {
    total_logs: number;
    total_screenshots: number;
  };
}
```

---

## 🎯 Quick Reference

### Export Commands

```bash
# Export everything
python3 export_data.py --all

# Export one device
python3 export_data.py --device-id device-abc123

# Export to custom location
python3 export_data.py --all --output ~/backups

# Export with timestamp
python3 export_data.py --all --output ~/backups/$(date +%Y%m%d_%H%M%S)
```

### Import Steps

1. Dashboard → Bulk Import
2. Select Folder or Files
3. Wait for import to complete
4. Check import results
5. Navigate to Devices to see imported data

### Clear Imported Data

1. Go to Bulk Import page
2. Scroll to "Imported Devices" section
3. Click "Clear All" button
4. Confirm deletion

---

## 💡 Pro Tips

1. **Scheduled Backups:** Set up daily exports using cron/Task Scheduler
2. **Version Control:** Add export date to folder name for easy tracking
3. **Compression:** Zip exports to save space: `zip -r exports.zip exports/`
4. **Validation:** Always verify export files before deleting source data
5. **Testing:** Use imports to create realistic test environments
6. **Documentation:** Keep a log of exports for audit trails
7. **Automation:** Integrate exports into CI/CD pipelines
8. **Monitoring:** Set up alerts for failed export jobs

---

## 📞 Need Help?

- Check the main `/agent/README.md` for agent setup
- Review `/IMPORT_EXPORT_GUIDE.md` (this file) for import/export
- Open browser console (F12) to see detailed error messages
- Check `keyguard_agent.log` for agent issues
- Verify AWS credentials and permissions

---

**Last Updated:** January 8, 2026  
**Version:** 1.0.0
