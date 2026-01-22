import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./ui/table";
import {
  Monitor,
  Laptop,
  Smartphone,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { DeviceDetails } from "./DeviceDetails";

const API_URL = "https://cw5b26zcta.execute-api.eu-north-1.amazonaws.com/prod/logs";

const getDeviceIcon = (type: string) => {
  switch (type) {
    case "Workstation":
      return Monitor;
    case "Laptop":
      return Laptop;
    case "Mobile":
      return Smartphone;
    default:
      return Monitor;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "online":
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Online</Badge>;
    case "offline":
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Offline</Badge>;
    case "warning":
      return <Badge className="bg-orange-500 hover:bg-orange-600"><AlertCircle className="h-3 w-3 mr-1" />Warning</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getComplianceBadge = (score: number) => {
  if (score >= 90) {
    return <Badge className="bg-green-500 hover:bg-green-600">{score}%</Badge>;
  } else if (score >= 75) {
    return <Badge className="bg-orange-500 hover:bg-orange-600">{score}%</Badge>;
  } else {
    return <Badge variant="destructive">{score}%</Badge>;
  }
};

const formatRelativeTime = (isoString: string) => {
  const now = new Date();
  const past = new Date(isoString);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return past.toLocaleDateString();
};

export function DeviceList() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data = await response.json();

      // Aggregate unique devices from logs, taking the most recent info
      const sortedLogs = [...data].sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const deviceMap: Record<string, any> = {};

      // Scan more logs for better device discovery
      const logsToProcess = sortedLogs.slice(0, 300);

      logsToProcess.forEach((log: any) => {
        if (!deviceMap[log.device_id]) {
          let systemInfo = {
            os: "Windows",
            ip: "Unknown",
            hostname: log.device_id.split('-').pop()?.toUpperCase() || "Unknown",
            location: "Remote Entry"
          };

          // Find the MOST recent info for this specific device
          const infoLog = logsToProcess.find(l => l.device_id === log.device_id && l.type === 'device_info_update');
          if (infoLog) {
            try {
              const data = typeof infoLog.data === 'string' ? JSON.parse(infoLog.data) : infoLog.data;
              systemInfo.os = data.os || systemInfo.os;
              systemInfo.ip = data.ip_address || systemInfo.ip;
              systemInfo.hostname = data.hostname || systemInfo.hostname;
              systemInfo.location = data.location || "Remote Entry";
            } catch (e) { }
          }

          const lastSeenDate = new Date(log.timestamp);
          // Device is online if seen in last 2 minutes (more aggressive check)
          const isOnline = (new Date().getTime() - lastSeenDate.getTime()) < (2 * 60 * 1000);

          // Get user from the most recent log that has a user field
          const userLog = logsToProcess.find(l => l.device_id === log.device_id && l.user);
          const userName = userLog?.user || log.user || "Unknown User";

          deviceMap[log.device_id] = {
            id: log.device_id,
            name: systemInfo.hostname,
            type: systemInfo.os.toLowerCase().includes('mac') ? "MacBook" : "Workstation",
            os: systemInfo.os,
            user: userName,
            status: isOnline ? "online" : "offline",
            lastSeen: formatRelativeTime(log.timestamp),
            rawTimestamp: log.timestamp,
            compliance: 95,
            ip: systemInfo.ip,
            location: systemInfo.location || "Remote Entry",
          };
        }
      });

      setDevices(Object.values(deviceMap));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const filteredDevices = devices.filter(d =>
    d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Device Management</h1>
          <p className="text-muted-foreground mt-1">
            Real-time status of all monitored devices
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDevices} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : devices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active IDs detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : devices.filter(d => d.status === 'online').length}</div>
            <p className="text-xs text-muted-foreground mt-1">100% availability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Health</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1">System average</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monitored Devices</CardTitle>
          <CardDescription>Live device feed from AWS Cloud</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or User..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Assigned User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Syncing with AWS Registry...
                    </TableCell>
                  </TableRow>
                ) : filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No devices found in the system.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    return (
                      <TableRow
                        key={device.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedDevice(device)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{device.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {device.id} • {device.os}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{device.user}</div>
                          <div className="text-xs text-muted-foreground">Monitoring active</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(device.status)}</TableCell>
                        <TableCell className="text-sm">{device.lastSeen}</TableCell>
                        <TableCell>{getComplianceBadge(device.compliance)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDevice(device);
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Device Details Modal */}
      {selectedDevice && (
        <DeviceDetails
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}
