import { useState } from "react";
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
  CheckCircle,
  Settings,
  Monitor,
  HardDrive,
  Activity,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export function MonitoringAgent() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [screenshotEnabled, setScreenshotEnabled] = useState(true);
  const [screenshotInterval, setScreenshotInterval] = useState([5]); // minutes
  const [keylogEnabled, setKeylogEnabled] = useState(true);
  const [fileTrackingEnabled, setFileTrackingEnabled] = useState(true);

  const handleExportLogs = () => {
    toast.success("Export initiated", {
      description: "Creating ZIP archive for manual S3 upload...",
    });
    
    setTimeout(() => {
      toast.success("Export complete", {
        description: "logs_export_2026-01-05.zip ready for upload to S3",
      });
    }, 2000);
  };

  const handleUploadToS3 = () => {
    toast.loading("Uploading to AWS S3...", { id: "upload" });
    
    setTimeout(() => {
      toast.success("Upload successful", {
        id: "upload",
        description: "Data synced to s3://keyguard360-logs/device-wks-1847/",
      });
    }, 3000);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      toast.success("Monitoring resumed", {
        description: "Agent is now collecting activity data",
      });
    } else {
      toast.warning("Monitoring paused", {
        description: "Data collection temporarily disabled",
      });
    }
  };

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
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last: 2 seconds ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screenshots</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next in {screenshotInterval[0]} min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245 MB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending sync
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
            {/* Screenshot Settings */}
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
                  <p className="text-xs text-muted-foreground">
                    More frequent captures = more storage & bandwidth usage
                  </p>
                </div>
              )}
            </div>

            {/* Keylog Settings */}
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

            {/* File Tracking */}
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

        {/* System Tray Indicator */}
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
                  <div className="text-white text-sm">
                    KeyGuard360
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The system tray icon shows real-time monitoring status
            </p>

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
                  <p className="text-sm text-muted-foreground mb-3">
                    Sync collected data to AWS cloud storage (requires boto3 integration)
                  </p>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pending uploads</span>
                      <span className="font-medium">245 MB</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <Button onClick={handleUploadToS3} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Sync to S3 Now
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    s3://keyguard360-logs/device-wks-1847/
                  </p>
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
                  <p className="text-sm text-muted-foreground mb-3">
                    Create a ZIP archive for manual upload or backup
                  </p>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Export size</span>
                      <span className="font-medium">~245 MB</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Includes: Screenshots, logs, activity data
                    </div>
                  </div>
                  <Button onClick={handleExportLogs} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export ZIP Archive
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Saved to: ~/Downloads/keyguard360_export/
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Next Steps for Production:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                  <li>Install boto3 package for AWS SDK integration</li>
                  <li>Configure AWS credentials (IAM role or access keys)</li>
                  <li>Set up automatic sync on interval (e.g., every 15 minutes)</li>
                  <li>Implement retry logic for failed uploads</li>
                  <li>Add encryption for local data storage</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Log</CardTitle>
          <CardDescription>Live monitoring events from this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { time: "14:32:45", event: "Screenshot captured", icon: Camera, color: "text-blue-600" },
              { time: "14:32:23", event: "File opened: Q4_Report.xlsx", icon: Monitor, color: "text-green-600" },
              { time: "14:31:58", event: "Application launched: Microsoft Excel", icon: Activity, color: "text-purple-600" },
              { time: "14:27:12", event: "Screenshot captured", icon: Camera, color: "text-blue-600" },
              { time: "14:25:33", event: "Network activity logged", icon: CheckCircle, color: "text-green-600" },
            ].map((log, index) => {
              const Icon = log.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <Icon className={`h-4 w-4 ${log.color}`} />
                  <span className="flex-1 text-sm">{log.event}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {log.time}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Monitoring is active only during work hours on company devices</li>
            <li>Users can view their own activity data at any time</li>
            <li>All data is encrypted in transit (TLS) and at rest (AES-256)</li>
            <li>Access to logs is restricted to authorized security personnel</li>
            <li>Compliant with GDPR, CCPA, and company privacy policies</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
