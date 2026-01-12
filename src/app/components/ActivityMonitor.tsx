import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Search, 
  Download, 
  FileText, 
  Mouse, 
  Keyboard, 
  Monitor,
  Camera,
  Mic,
  HardDrive,
  Network,
  Clock
} from "lucide-react";

const activityLogs = [
  {
    id: "LOG-8472",
    timestamp: "2026-01-05 14:32:15",
    device: "WKS-1847",
    user: "john.smith@company.com",
    type: "file_access",
    action: "Accessed file: /documents/Q4_Financial_Report.xlsx",
    severity: "info",
    details: "File opened in Microsoft Excel",
  },
  {
    id: "LOG-8473",
    timestamp: "2026-01-05 14:31:42",
    device: "LPT-2765",
    user: "lisa.anderson@company.com",
    type: "screenshot",
    action: "Screenshot captured",
    severity: "info",
    details: "Stored in S3: screenshots/2026-01-05/lpt-2765-143142.png",
  },
  {
    id: "LOG-8474",
    timestamp: "2026-01-05 14:30:58",
    device: "WKS-2156",
    user: "mike.chen@company.com",
    type: "network",
    action: "Connection to external IP: 203.45.67.89",
    severity: "warning",
    details: "Flagged as potential data exfiltration attempt",
  },
  {
    id: "LOG-8475",
    timestamp: "2026-01-05 14:29:33",
    device: "WKS-3098",
    user: "chris.wilson@company.com",
    type: "application",
    action: "Installed application: Chrome Extension - DataSync",
    severity: "warning",
    details: "Requires security review",
  },
  {
    id: "LOG-8476",
    timestamp: "2026-01-05 14:28:07",
    device: "LPT-0932",
    user: "sarah.johnson@company.com",
    type: "login",
    action: "Failed authentication attempt",
    severity: "critical",
    details: "Multiple failed login attempts detected",
  },
  {
    id: "LOG-8477",
    timestamp: "2026-01-05 14:27:21",
    device: "WKS-1847",
    user: "john.smith@company.com",
    type: "usb",
    action: "USB device connected: SanDisk Ultra 64GB",
    severity: "warning",
    details: "Removable media policy violation",
  },
  {
    id: "LOG-8478",
    timestamp: "2026-01-05 14:26:45",
    device: "LPT-1443",
    user: "emma.davis@company.com",
    type: "file_transfer",
    action: "File uploaded to cloud storage",
    severity: "info",
    details: "Uploaded: employee_data.csv to Google Drive",
  },
  {
    id: "LOG-8479",
    timestamp: "2026-01-05 14:25:12",
    device: "WKS-2156",
    user: "mike.chen@company.com",
    type: "process",
    action: "Process terminated: suspicious_script.exe",
    severity: "critical",
    details: "Malware detected and quarantined by security agent",
  },
  {
    id: "LOG-8480",
    timestamp: "2026-01-05 14:24:33",
    device: "LPT-2765",
    user: "lisa.anderson@company.com",
    type: "email",
    action: "Email sent with attachment",
    severity: "info",
    details: "Sent to: external@competitor.com with proposal.pdf",
  },
  {
    id: "LOG-8481",
    timestamp: "2026-01-05 14:23:08",
    device: "WKS-4512",
    user: "david.brown@company.com",
    type: "system",
    action: "System configuration changed",
    severity: "warning",
    details: "Firewall settings modified",
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "file_access":
    case "file_transfer":
      return FileText;
    case "screenshot":
      return Camera;
    case "network":
      return Network;
    case "application":
    case "process":
      return Monitor;
    case "login":
      return Keyboard;
    case "usb":
      return HardDrive;
    case "email":
      return Mouse;
    default:
      return Clock;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "warning":
      return <Badge className="bg-orange-500 hover:bg-orange-600">Warning</Badge>;
    case "info":
      return <Badge variant="secondary">Info</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
};

export function ActivityMonitor() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Activity Monitor</h1>
        <p className="text-muted-foreground mt-1">
          Real-time activity logs from all monitored devices
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48,392</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screenshots</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground mt-1">Stored in S3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Accesses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,234</div>
            <p className="text-xs text-muted-foreground mt-1">Across all devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Events</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,421</div>
            <p className="text-xs text-muted-foreground mt-1">42 flagged</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Real-time monitoring of device activities</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="warning">Warnings</TabsTrigger>
              <TabsTrigger value="file">File Access</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search activity logs..." className="pl-8" />
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {activityLogs.map((log) => {
                    const Icon = getActivityIcon(log.type);
                    return (
                      <div key={log.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 text-muted-foreground">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-medium">{log.action}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {log.details}
                                </p>
                              </div>
                              {getSeverityBadge(log.severity)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.timestamp}
                              </span>
                              <span className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                {log.device}
                              </span>
                              <span>{log.user}</span>
                              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                {log.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="critical">
              <div className="space-y-3">
                {activityLogs.filter(log => log.severity === "critical").map((log) => {
                  const Icon = getActivityIcon(log.type);
                  return (
                    <div key={log.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 text-red-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span>{log.timestamp}</span>
                            <span>{log.device}</span>
                            <span>{log.user}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="warning">
              <p className="text-sm text-muted-foreground">Showing warning-level events only</p>
            </TabsContent>

            <TabsContent value="file">
              <p className="text-sm text-muted-foreground">Showing file access events only</p>
            </TabsContent>

            <TabsContent value="network">
              <p className="text-sm text-muted-foreground">Showing network events only</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
