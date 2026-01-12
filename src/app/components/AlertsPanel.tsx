import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { 
  Bell, 
  Shield, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Filter
} from "lucide-react";

const alerts = [
  {
    id: "ALT-9821",
    timestamp: "2026-01-05 14:42:15",
    severity: "critical",
    type: "Security Threat",
    title: "Malware detected and quarantined",
    description: "Suspicious executable file detected on WKS-2156. File has been automatically quarantined and admin notified.",
    device: "WKS-2156",
    user: "mike.chen@company.com",
    status: "active",
    channel: ["email", "sms"],
  },
  {
    id: "ALT-9820",
    timestamp: "2026-01-05 14:35:08",
    severity: "high",
    type: "Unauthorized Access",
    title: "Multiple failed login attempts",
    description: "5 failed authentication attempts detected on LPT-0932 within 10 minutes. Account temporarily locked.",
    device: "LPT-0932",
    user: "sarah.johnson@company.com",
    status: "acknowledged",
    channel: ["email"],
  },
  {
    id: "ALT-9819",
    timestamp: "2026-01-05 14:28:42",
    severity: "medium",
    type: "Policy Violation",
    title: "USB device policy violation",
    description: "Unauthorized USB storage device connected to workstation. Data transfer blocked per security policy.",
    device: "WKS-1847",
    user: "john.smith@company.com",
    status: "active",
    channel: ["email", "slack"],
  },
  {
    id: "ALT-9818",
    timestamp: "2026-01-05 14:15:23",
    severity: "high",
    type: "Data Exfiltration",
    title: "Large file transfer detected",
    description: "Attempted upload of 2.3GB of data to external cloud storage. Transfer blocked and logged.",
    device: "LPT-1443",
    user: "emma.davis@company.com",
    status: "resolved",
    channel: ["email", "sms"],
  },
  {
    id: "ALT-9817",
    timestamp: "2026-01-05 14:08:56",
    severity: "low",
    type: "System Status",
    title: "Device went offline",
    description: "Device has been offline for more than 2 hours. Last known location: Seattle, WA",
    device: "MOB-0821",
    user: "alex.martinez@company.com",
    status: "active",
    channel: ["email"],
  },
  {
    id: "ALT-9816",
    timestamp: "2026-01-05 13:52:14",
    severity: "critical",
    type: "Security Threat",
    title: "Ransomware attempt blocked",
    description: "Ransomware encryption pattern detected and blocked. System rollback initiated successfully.",
    device: "WKS-4512",
    user: "david.brown@company.com",
    status: "resolved",
    channel: ["email", "sms", "slack"],
  },
  {
    id: "ALT-9815",
    timestamp: "2026-01-05 13:43:07",
    severity: "medium",
    type: "Compliance",
    title: "Compliance scan completed",
    description: "Scheduled compliance scan found 3 minor issues. Report generated and available for review.",
    device: "System",
    user: "System",
    status: "acknowledged",
    channel: ["email"],
  },
  {
    id: "ALT-9814",
    timestamp: "2026-01-05 13:28:35",
    severity: "high",
    type: "Network Activity",
    title: "Suspicious network traffic",
    description: "Unusual outbound network traffic detected to unknown IP addresses. Connection terminated.",
    device: "WKS-3098",
    user: "chris.wilson@company.com",
    status: "active",
    channel: ["email", "sms"],
  },
];

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Shield className="h-5 w-5 text-red-600" />;
    case "high":
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    case "medium":
      return <Info className="h-5 w-5 text-yellow-600" />;
    case "low":
      return <Info className="h-5 w-5 text-blue-600" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
    case "low":
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="destructive"><Bell className="h-3 w-3 mr-1" />Active</Badge>;
    case "acknowledged":
      return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Acknowledged</Badge>;
    case "resolved":
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getChannelIcons = (channels: string[]) => {
  return (
    <div className="flex items-center gap-2">
      {channels.map((channel) => {
        switch (channel) {
          case "email":
            return <Mail key={channel} className="h-4 w-4 text-muted-foreground" />;
          case "sms":
            return <Smartphone key={channel} className="h-4 w-4 text-muted-foreground" />;
          case "slack":
            return <MessageSquare key={channel} className="h-4 w-4 text-muted-foreground" />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export function AlertsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Alerts & Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Real-time security alerts and system notifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground mt-1">Average resolution: 18 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">384</div>
            <p className="text-xs text-muted-foreground mt-1">Via email, SMS, Slack</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Alert Feed */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alert Feed</CardTitle>
                  <CardDescription>Real-time security notifications</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active (42)</TabsTrigger>
                  <TabsTrigger value="acknowledged">Acknowledged (23)</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved (127)</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4">
                  <ScrollArea className="h-[700px] pr-4">
                    <div className="space-y-3">
                      {alerts.filter(a => a.status === "active").map((alert) => (
                        <div key={alert.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getSeverityBadge(alert.severity)}
                                    <Badge variant="outline">{alert.type}</Badge>
                                  </div>
                                  <p className="font-medium">{alert.title}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {alert.description}
                                  </p>
                                </div>
                                {getStatusBadge(alert.status)}
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {alert.timestamp}
                                  </span>
                                  <span>{alert.device}</span>
                                  <span>{alert.user}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getChannelIcons(alert.channel)}
                                  <Button size="sm" variant="outline">
                                    Acknowledge
                                  </Button>
                                  <Button size="sm">
                                    Resolve
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="acknowledged">
                  <div className="space-y-3">
                    {alerts.filter(a => a.status === "acknowledged").map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium">{alert.title}</p>
                                <p className="text-sm text-muted-foreground">{alert.device}</p>
                              </div>
                              {getStatusBadge(alert.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resolved">
                  <div className="space-y-3">
                    {alerts.filter(a => a.status === "resolved").map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4 opacity-60">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium">{alert.title}</p>
                                <p className="text-sm text-muted-foreground">{alert.device} • {alert.timestamp}</p>
                              </div>
                              {getStatusBadge(alert.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure alert channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-critical">Critical Alerts</Label>
                      <Switch id="email-critical" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-high">High Priority</Label>
                      <Switch id="email-high" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-medium">Medium Priority</Label>
                      <Switch id="email-medium" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-low">Low Priority</Label>
                      <Switch id="email-low" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-critical">Critical Alerts</Label>
                      <Switch id="sms-critical" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-high">High Priority</Label>
                      <Switch id="sms-high" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Slack Integration
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slack-critical">Critical Alerts</Label>
                      <Switch id="slack-critical" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slack-high">High Priority</Label>
                      <Switch id="slack-high" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slack-medium">Medium Priority</Label>
                      <Switch id="slack-medium" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Alert Statistics</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Critical</span>
                  <span className="font-medium text-red-600">8</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">High</span>
                  <span className="font-medium text-orange-600">15</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Medium</span>
                  <span className="font-medium text-yellow-600">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Low</span>
                  <span className="font-medium text-blue-600">7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
