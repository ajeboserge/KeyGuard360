import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Monitor, 
  X, 
  Calendar,
  MapPin,
  Wifi,
  HardDrive,
  Cpu,
  Clock,
  Image as ImageIcon,
  FileText,
  Activity,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface DeviceDetailsProps {
  device: {
    id: string;
    name: string;
    type: string;
    os: string;
    user: string;
    status: string;
    lastSeen: string;
    compliance: number;
    ip: string;
    location: string;
  };
  onClose: () => void;
}

// Mock screenshot data
const mockScreenshots = [
  { id: 1, timestamp: "2026-01-05 14:32:15", description: "Working on financial report" },
  { id: 2, timestamp: "2026-01-05 14:17:42", description: "Email communication" },
  { id: 3, timestamp: "2026-01-05 14:02:28", description: "Web browsing activity" },
  { id: 4, timestamp: "2026-01-05 13:45:11", description: "Document editing" },
  { id: 5, timestamp: "2026-01-05 13:28:55", description: "Video conference" },
  { id: 6, timestamp: "2026-01-05 13:12:33", description: "Code development" },
];

// Mock activity timeline
const activityTimeline = [
  {
    time: "14:32:15",
    type: "file_access",
    action: "Opened: Q4_Financial_Report.xlsx",
    severity: "info",
  },
  {
    time: "14:28:42",
    type: "network",
    action: "Connected to VPN: company-vpn-us-west",
    severity: "info",
  },
  {
    time: "14:15:23",
    type: "application",
    action: "Launched: Microsoft Excel",
    severity: "info",
  },
  {
    time: "14:08:11",
    type: "usb",
    action: "USB device connected: SanDisk Ultra 64GB",
    severity: "warning",
  },
  {
    time: "13:52:45",
    type: "file_transfer",
    action: "Downloaded: employee_handbook.pdf (2.3 MB)",
    severity: "info",
  },
  {
    time: "13:38:22",
    type: "authentication",
    action: "Successfully authenticated via MFA",
    severity: "info",
  },
  {
    time: "13:35:18",
    type: "system",
    action: "System boot completed",
    severity: "info",
  },
  {
    time: "13:34:52",
    type: "login",
    action: "User login successful",
    severity: "info",
  },
];

// Mock keylog data
const mockKeylogData = `[2026-01-05 14:32:15] Application: Microsoft Excel
Q4 revenue analysis
Total: $4.2M
Growth: 23% YoY

[2026-01-05 14:28:42] Application: Outlook
Subject: Re: Budget Approval
Hi team, I've reviewed the proposal...

[2026-01-05 14:15:23] Application: Chrome Browser
URL: https://docs.company.com/financial-reports
Search: "quarterly revenue trends"

[2026-01-05 14:08:11] Application: File Explorer
Navigated to: Documents/Confidential/
Copied file: budget_2026.xlsx

[2026-01-05 13:52:45] Application: Slack
Channel: #finance-team
Message: "Can someone review the Q4 numbers?"

[2026-01-05 13:38:22] Application: VPN Client
Connected to: company-vpn-us-west
Status: Secure connection established`;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "online":
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Online</Badge>;
    case "offline":
      return <Badge variant="secondary">Offline</Badge>;
    case "warning":
      return <Badge className="bg-orange-500 hover:bg-orange-600"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "warning":
      return "text-orange-600";
    case "error":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
};

export function DeviceDetails({ device, onClose }: DeviceDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{device.name}</h2>
                <p className="text-sm text-muted-foreground">{device.id}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Device Info Summary */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(device.status)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{device.compliance}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Seen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{device.lastSeen}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {device.location}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <Cpu className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Operating System</p>
                    <p className="text-sm text-muted-foreground">{device.os}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wifi className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">IP Address</p>
                    <p className="text-sm text-muted-foreground font-mono">{device.ip}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Storage</p>
                    <p className="text-sm text-muted-foreground">256 GB (68% used)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">User</p>
                    <p className="text-sm text-muted-foreground">{device.user}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different views */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
              <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
              <TabsTrigger value="keylog">Keylog Data</TabsTrigger>
            </TabsList>

            {/* Activity Timeline */}
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Real-time activity tracking from this device</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {activityTimeline.map((activity, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
                            {index !== activityTimeline.length - 1 && (
                              <div className="w-px h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pt-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium">{activity.action}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                                  <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                                </div>
                              </div>
                              <Badge variant={activity.severity === 'warning' ? 'destructive' : 'secondary'} className="text-xs">
                                {activity.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Screenshots Gallery */}
            <TabsContent value="screenshots" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Screenshot Gallery</CardTitle>
                      <CardDescription>
                        Captured screenshots stored in AWS S3 (mock images)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View in S3
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {mockScreenshots.map((screenshot) => (
                        <div key={screenshot.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative group">
                            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                View Full
                              </Button>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="text-xs">
                                {screenshot.id}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Clock className="h-3 w-3" />
                              {screenshot.timestamp}
                            </div>
                            <p className="text-sm font-medium">{screenshot.description}</p>
                            <div className="mt-2 text-xs text-muted-foreground font-mono">
                              s3://keyguard360/screenshots/{device.id}/{screenshot.id}.png
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Keylog Data */}
            <TabsContent value="keylog" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Keylog Excerpt</CardTitle>
                      <CardDescription>
                        Activity logging data (encrypted in transit & at rest)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Logs
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium">Privacy Notice</p>
                      <p className="mt-1">Keylogging is enabled with user consent. All data is encrypted and access is logged for compliance.</p>
                    </div>
                  </div>
                  <ScrollArea className="h-[350px]">
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs">
                      <pre className="whitespace-pre-wrap">{mockKeylogData}</pre>
                    </div>
                  </ScrollArea>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Stored in: DynamoDB Table "keyguard360-logs"</span>
                    <span>Total logs today: 2,847 entries</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Device registered: Jan 2, 2026 • Last sync: {device.lastSeen}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="destructive">
              Unregister Device
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
