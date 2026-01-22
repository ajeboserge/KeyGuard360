import { useState, useEffect } from "react";
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
  Clock,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// API Configuration
const API_URL = "https://cw5b26zcta.execute-api.eu-north-1.amazonaws.com/prod/logs";

interface LogEntry {
  id: string;
  timestamp: string;
  device: string;
  user: string;
  type: string;
  action: string;
  severity: string;
  details: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "file_access":
    case "file_transfer":
      return FileText;
    case "screenshot":
    case "screenshot_captured":
      return Camera;
    case "network":
      return Network;
    case "application":
    case "process":
      return Monitor;
    case "login":
    case "keylog":
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

const LogItem = ({ log }: { log: LogEntry }) => {
  const Icon = getActivityIcon(log.type);
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
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
};

export function ActivityMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch logs from AWS");

      const rawData = await response.json();

      // Map raw DynamoDB data to UI format
      const mappedLogs: LogEntry[] = rawData.map((item: any) => ({
        id: item.log_id || `LOG-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        timestamp: new Date(item.timestamp).toLocaleString(),
        device: item.device_id || "Unknown Device",
        user: item.user || "Unknown User",
        type: item.type || "unknown",
        action: item.type === 'keylog' ? 'Keystrokes Captured' :
          item.type === 'screenshot_captured' ? 'Screenshot Captured' :
            'Activity Logged',
        severity: item.type === 'critical' ? 'critical' : 'info',
        details: item.type === 'keylog' ? `Detected ${item.count || 0} keystrokes` :
          item.type === 'screenshot_captured' ? `Saved to S3 Bucket` :
            `Item: ${item.data ? JSON.stringify(item.data).substring(0, 50) : 'N/A'}`
      }));

      // Sort by timestamp (newest first)
      mappedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(mappedLogs);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error("Cloud Sync Error", {
        description: "Could not retrieve logs from AWS Lambda backend."
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvRows = [];
    const headers = ["ID", "Timestamp", "Device", "User", "Type", "Action", "Severity", "Details"];
    csvRows.push(headers.join(','));

    for (const log of logs) {
      const row = [
        log.id,
        log.timestamp,
        log.device,
        log.user,
        log.type,
        `"${log.action.replace(/"/g, '""')}"`,
        log.severity,
        `"${log.details.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `keyguard_full_activity_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Export Successful", {
      description: `Downloaded ${logs.length} activity records.`
    });
  };

  const getStats = () => {
    const today = new Date().toLocaleDateString();
    return {
      totalToday: logs.filter(l => new Date(l.timestamp).toLocaleDateString() === today).length,
      screenshots: logs.filter(l => l.type === 'screenshot_captured').length,
      fileAccess: logs.filter(l => l.type === 'file_access' || l.type === 'file_transfer').length,
      network: logs.filter(l => l.type === 'network').length,
    };
  };

  const stats = getStats();

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
            <div className="text-2xl font-bold">{stats.totalToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Real-time sync active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screenshots</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.screenshots.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Stored in S3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Accesses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fileAccess.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Events</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.network.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Live traffic monitor</p>
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
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={loading || logs.length === 0}>
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
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activity logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {loading && logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                  <RefreshCw className="h-10 w-10 animate-spin" />
                  <p>Fetching latest activity from AWS...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-destructive space-y-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <AlertCircle className="h-10 w-10" />
                  <div className="text-center">
                    <p className="font-semibold">Failed to load logs</p>
                    <p className="text-sm opacity-80">{error}</p>
                  </div>
                  <Button variant="outline" onClick={fetchLogs} size="sm">Try Again</Button>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                  <Search className="h-10 w-10 opacity-20" />
                  <p>No activity logs found</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {filteredLogs.map((log) => (
                      <LogItem key={log.id} log={log} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="critical">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {logs.filter(log => log.severity === "critical").map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                  {logs.filter(log => log.severity === "critical").length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">No critical events found.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="warning">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {logs.filter(log => log.severity === "warning").map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                  {logs.filter(log => log.severity === "warning").length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">No warning events found.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="file">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {logs.filter(log => log.type === "file_access" || log.type === "file_transfer").map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                  {logs.filter(log => log.type === "file_access" || log.type === "file_transfer").length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">No file access events found.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="network">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {logs.filter(log => log.type === "network").map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                  {logs.filter(log => log.type === "network").length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">No network events found.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
