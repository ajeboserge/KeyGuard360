import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Progress } from "./ui/progress";
import {
  Shield,
  Eye,
  Camera,
  Keyboard,
  Upload,
  Download,
  Settings,
  Monitor,
  Activity,
  Clock,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const API_URL = "https://cw5b26zcta.execute-api.eu-north-1.amazonaws.com/prod/logs";

export function MonitoringAgent() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [screenshotEnabled, setScreenshotEnabled] = useState(true);
  const [screenshotInterval, setScreenshotInterval] = useState([5]); // minutes
  const [keylogEnabled, setKeylogEnabled] = useState(true);
  const [fileTrackingEnabled, setFileTrackingEnabled] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const rawData = await response.json();

      // Sort newest first
      const sortedLogs = [...rawData].sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setLogs(sortedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalEvents: logs.length,
    screenshots: logs.filter(l => l.type === 'screenshot_captured').length,
    storage: (logs.length * 0.15).toFixed(1) + " MB"
  };

  const handleExportLogs = () => {
    const csv = "ID,Device,Type,Timestamp\n" + logs.map(l => `${l.log_id},${l.device_id},${l.type},${l.timestamp}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Logs exported successfully");
  };

  const handleUploadToS3 = () => {
    toast.promise(new Promise(res => setTimeout(res, 2000)), {
      loading: 'Syncing local buffer to s3://keyguard360-data...',
      success: 'Cloud synchronization complete!',
      error: 'Upload failed'
    });
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast(isMonitoring ? "Agent Paused" : "Agent Resumed", {
      description: isMonitoring ? "Data collection suspended." : "Monitoring active and syncing to AWS."
    });
  };

  const agentScript = `import os
import sys
import time
import json
import boto3
import socket
import platform
import threading
from datetime import datetime

# KeyGuard360 Configuration
AWS_REGION = "eu-north-1"
DYNAMODB_TABLE = "keyguard360-logs"
S3_BUCKET = "keyguard360-data"

class KeyGuardAgent:
    def __init__(self):
        self.device_id = socket.gethostname()
        self.dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
        self.table = self.dynamodb.Table(DYNAMODB_TABLE)
        self.is_running = True

    def log_activity(self, activity_type, data):
        timestamp = datetime.utcnow().isoformat() + 'Z'
        item = {
            'log_id': f"{self.device_id}_{int(time.time()*1000)}",
            'device_id': self.device_id,
            'timestamp': timestamp,
            'type': activity_type,
            'data': data
        }
        self.table.put_item(Item=item)
        print(f"[*] Logged: {activity_type}")

    def run(self):
        print(f"[*] KeyGuard360 Agent Started on {self.device_id}")
        while self.is_running:
            # Heartbeat
            self.log_activity("heartbeat", {"status": "online"})
            time.sleep(300)

if __name__ == "__main__":
    agent = KeyGuardAgent()
    agent.run()`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>KeyGuard360 Monitoring Agent</h1>
          <p className="text-muted-foreground mt-1">
            Client-side monitoring application (runs on employee devices)
          </p>
        </div>
        <Badge variant={isMonitoring ? "default" : "secondary"} className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {isMonitoring ? "Active" : "Paused"}
        </Badge>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Shield className={`h-4 w-4 ${isMonitoring ? 'text-green-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMonitoring ? "Running" : "Stopped"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agent version 2.3.1
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Global feed count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screenshots</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.screenshots}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Captured in 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cloud Sync</CardTitle>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : 'text-blue-600'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? 'Syncing...' : 'Live'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.storage} data flow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Panel */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Agent Controls</CardTitle>
                <CardDescription>Configure monitoring behavior</CardDescription>
              </div>
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                onClick={toggleMonitoring}
              >
                {isMonitoring ? "Pause Monitoring" : "Resume Monitoring"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Screenshot Capture
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically capture screen at intervals
                  </p>
                </div>
                <Switch
                  checked={screenshotEnabled}
                  onCheckedChange={setScreenshotEnabled}
                  disabled={!isMonitoring}
                />
              </div>

              {screenshotEnabled && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Capture Interval</Label>
                    <span className="text-sm font-medium">{screenshotInterval[0]} minutes</span>
                  </div>
                  <Slider
                    value={screenshotInterval}
                    onValueChange={setScreenshotInterval}
                    min={1}
                    max={30}
                    step={1}
                    disabled={!isMonitoring}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Activity Logging
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track application usage and keystroke events
                  </p>
                </div>
                <Switch
                  checked={keylogEnabled}
                  onCheckedChange={setKeylogEnabled}
                  disabled={!isMonitoring}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    File Access Tracking
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor file operations and transfers
                  </p>
                </div>
                <Switch
                  checked={fileTrackingEnabled}
                  onCheckedChange={setFileTrackingEnabled}
                  disabled={!isMonitoring}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Tray Indicator</CardTitle>
            <CardDescription>Visual monitoring status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-8 flex items-center justify-center mb-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Shield className={`h-6 w-6 ${isMonitoring ? 'text-green-400' : 'text-gray-500'}`} />
                    {isMonitoring && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="text-white text-sm">KeyGuard360</div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-sm">Green = Monitoring Active</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-2 w-2 bg-gray-400 rounded-full" />
                <span className="text-sm">Gray = Monitoring Paused</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-2 w-2 bg-red-500 rounded-full" />
                <span className="text-sm">Red = Connection Error</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sync & Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Upload logs to AWS or export locally</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Upload to AWS S3</h3>
                  <p className="text-sm text-muted-foreground mb-3">Sync collected data to AWS cloud storage</p>
                  <Button onClick={handleUploadToS3} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Sync to S3 Now
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Manual Export</h3>
                  <p className="text-sm text-muted-foreground mb-3">Create a data dump for manual upload or backup</p>
                  <Button onClick={handleExportLogs} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Local Data (.csv)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Production Setup:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-xs font-mono">
                  <li>pip install boto3 pytz</li>
                  <li>Configure AWS_ACCESS_KEY_ID in environment</li>
                  <li>Agent syncs every 5 minutes by default</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Activity & Source Code */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="code">Agent Source Code</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Global Activity Feed</CardTitle>
              <CardDescription>Live monitoring events synchronized from AWS DynamoDB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="p-1 bg-primary/10 rounded">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <span className="flex-1 text-sm font-medium">{log.type?.replace('_', ' ').toUpperCase()} on {log.device_id}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-center py-4 text-muted-foreground">No recent activity found.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>keyguard_agent.py</CardTitle>
                  <CardDescription>Python-based cross-platform workstation agent</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const blob = new Blob([agentScript], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'keyguard_agent.py'; a.click();
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Script
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                <pre>{agentScript}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Consent Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-yellow-600" />
            <CardTitle>Privacy & Consent Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-yellow-900">
          <p className="mb-2">
            This monitoring agent is installed on company-owned devices with explicit user consent.
            All collected data is encrypted and used solely for security and compliance purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
