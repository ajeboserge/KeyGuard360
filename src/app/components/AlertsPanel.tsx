import { useState, useEffect } from "react";
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
  Filter,
  RefreshCw,
  Download
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://cw5b26zcta.execute-api.eu-north-1.amazonaws.com/prod/logs";

interface AlertEntry {
  id: string;
  timestamp: string;
  severity: string;
  type: string;
  title: string;
  description: string;
  device: string;
  user: string;
  status: "active" | "acknowledged" | "resolved";
  channel: string[];
}

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
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();

      // Convert logs to alerts (filter for high/critical or specific types)
      const mappedAlerts: AlertEntry[] = data.map((item: any) => {
        const typeMapping: Record<string, string> = {
          'screenshot_captured': 'Security Scan',
          'keylog': 'Data Capture',
          'device_info_update': 'System Status',
          'unauthorized_access': 'Security Threat',
          'file_access': 'Policy Monitor'
        };

        const severity = item.severity || (
          item.type === 'critical' ? 'critical' :
            item.type === 'unauthorized_access' ? 'high' :
              'medium'
        );

        return {
          id: item.log_id || `ALT-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          timestamp: new Date(item.timestamp).toLocaleString(),
          severity: severity,
          type: typeMapping[item.type] || 'System Event',
          title: item.type === 'keylog' ? `Keystroke activity on ${item.device_id}` :
            item.type === 'screenshot_captured' ? `Screen capture on ${item.device_id}` :
              `Alert from ${item.device_id}`,
          description: `Activity detected on device ${item.device_id}. Data: ${JSON.stringify(item.data).substring(0, 100)}...`,
          device: item.device_id || "System",
          user: item.user || "Unknown User",
          status: item.status || "active",
          channel: ["email"]
        };
      });

      setAlerts(mappedAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) {
      console.error(err);
      toast.error("Alert Sync Error", { description: "Failed to load live alerts." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (id: string, newStatus: "acknowledged" | "resolved") => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast.success(`Alert ${newStatus}`, { description: `Item ${id} updated.` });
  };

  const exportAlerts = () => {
    const csvRows = [];
    const headers = ["ID", "Timestamp", "Severity", "Type", "Device", "Status"];
    csvRows.push(headers.join(','));
    alerts.forEach(a => csvRows.push([a.id, a.timestamp, a.severity, a.type, a.device, a.status].join(',')));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alerts_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = {
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    resolvedToday: alerts.filter(a => a.status === 'resolved').length,
    totalSent: alerts.length * 2
  };

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
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Auto-synced from AWS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Feed Status</CardTitle>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? 'Syncing...' : 'Connected'}</div>
            <p className="text-xs text-muted-foreground mt-1">Refreshing every 30s</p>
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
                  <CardDescription>Real-time security notifications from your devices</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportAlerts} disabled={loading || alerts.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                  <TabsTrigger value="acknowledged">Acknowledged ({alerts.filter(a => a.status === 'acknowledged').length})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({stats.resolvedToday})</TabsTrigger>
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
                                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(alert.id, "acknowledged")}>
                                    Acknowledge
                                  </Button>
                                  <Button size="sm" onClick={() => handleStatusChange(alert.id, "resolved")}>
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
              <CardTitle>Alert Distribution</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Critical</span>
                  <span className="font-medium text-red-600">{stats.critical}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">High</span>
                  <span className="font-medium text-orange-600">{alerts.filter(a => a.severity === 'high').length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Medium</span>
                  <span className="font-medium text-yellow-600">{alerts.filter(a => a.severity === 'medium').length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Low</span>
                  <span className="font-medium text-blue-600">{alerts.filter(a => a.severity === 'low').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
