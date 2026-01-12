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
  Download,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { DeviceDetails } from "./DeviceDetails";

const devices = [
  {
    id: "WKS-1847",
    name: "Engineering-PC-47",
    type: "Workstation",
    os: "Windows 11 Pro",
    user: "john.smith@company.com",
    status: "online",
    lastSeen: "2 minutes ago",
    compliance: 98,
    ip: "192.168.1.47",
    location: "San Francisco, CA",
  },
  {
    id: "LPT-0932",
    name: "Sales-Laptop-32",
    type: "Laptop",
    os: "macOS 14.2",
    user: "sarah.johnson@company.com",
    status: "offline",
    lastSeen: "3 hours ago",
    compliance: 85,
    ip: "192.168.1.132",
    location: "New York, NY",
  },
  {
    id: "WKS-2156",
    name: "Design-Station-56",
    type: "Workstation",
    os: "Windows 11 Pro",
    user: "mike.chen@company.com",
    status: "online",
    lastSeen: "Just now",
    compliance: 100,
    ip: "192.168.1.156",
    location: "Austin, TX",
  },
  {
    id: "LPT-1443",
    name: "HR-Laptop-43",
    type: "Laptop",
    os: "Windows 11 Pro",
    user: "emma.davis@company.com",
    status: "online",
    lastSeen: "5 minutes ago",
    compliance: 92,
    ip: "192.168.1.243",
    location: "Chicago, IL",
  },
  {
    id: "MOB-0821",
    name: "Mobile-Device-21",
    type: "Mobile",
    os: "iOS 17.2",
    user: "alex.martinez@company.com",
    status: "warning",
    lastSeen: "1 hour ago",
    compliance: 76,
    ip: "192.168.1.121",
    location: "Seattle, WA",
  },
  {
    id: "WKS-3098",
    name: "DevOps-Server-98",
    type: "Workstation",
    os: "Ubuntu 22.04 LTS",
    user: "chris.wilson@company.com",
    status: "online",
    lastSeen: "1 minute ago",
    compliance: 100,
    ip: "192.168.1.198",
    location: "Boston, MA",
  },
  {
    id: "LPT-2765",
    name: "Marketing-Laptop-65",
    type: "Laptop",
    os: "macOS 14.1",
    user: "lisa.anderson@company.com",
    status: "online",
    lastSeen: "8 minutes ago",
    compliance: 94,
    ip: "192.168.1.165",
    location: "Los Angeles, CA",
  },
  {
    id: "WKS-4512",
    name: "Finance-PC-12",
    type: "Workstation",
    os: "Windows 11 Pro",
    user: "david.brown@company.com",
    status: "offline",
    lastSeen: "2 days ago",
    compliance: 68,
    ip: "192.168.1.212",
    location: "Miami, FL",
  },
];

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

export function DeviceList() {
  const [selectedDevice, setSelectedDevice] = useState<typeof devices[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1>Device Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage all registered devices
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,156</div>
            <p className="text-xs text-muted-foreground mt-1">90.0% availability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registered Devices</CardTitle>
              <CardDescription>Complete list of monitored devices</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search devices..." className="pl-8" />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
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
                        <div className="text-sm">{device.user}</div>
                        <div className="text-xs text-muted-foreground">{device.ip}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(device.status)}</TableCell>
                      <TableCell className="text-sm">{device.lastSeen}</TableCell>
                      <TableCell>{getComplianceBadge(device.compliance)}</TableCell>
                      <TableCell className="text-sm">{device.location}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDevice(device);
                            }}>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Logs</DropdownMenuItem>
                            <DropdownMenuItem>Run Compliance Scan</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Unregister Device
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
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