import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, Monitor, AlertTriangle, CheckCircle, Activity, TrendingUp, RefreshCw } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const API_URL = "https://cw5b26zcta.execute-api.eu-north-1.amazonaws.com/prod/logs";

const threatData = [
  { name: "Low", value: 145, color: "#10b981" },
  { name: "Medium", value: 32, color: "#f59e0b" },
  { name: "High", value: 8, color: "#ef4444" },
  { name: "Critical", value: 2, color: "#991b1b" },
];

const complianceData = [
  { category: "Access Control", score: 98 },
  { category: "Data Protection", score: 95 },
  { category: "Activity Logging", score: 100 },
  { category: "Encryption", score: 92 },
];

export function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeDevices: 0,
    criticalAlerts: 0,
    onlineRate: 0,
    recentEvents: [] as any[],
    activityData: [] as any[],
    threatTypeData: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const rawData = await response.json();

      // Sort data to show newest logs first
      const data = [...rawData].sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // 1. Core Metrics
      const devices = new Set(data.map((item: any) => item.device_id));
      const criticals = data.filter((item: any) => item.type === 'critical').length;

      // 2. Map Events for Activity Timeline (Hourly grouping)
      const hourly: Record<string, number> = {};
      data.forEach((item: any) => {
        const h = new Date(item.timestamp).getHours();
        const label = `${h}:00`;
        hourly[label] = (hourly[label] || 0) + 1;
      });
      const chartActivity = Object.entries(hourly)
        .map(([time, events]) => ({ time, events }))
        .sort((a, b) => parseInt(a.time) - parseInt(b.time));

      // 3. Map Events for Distribution Chart
      const typeCounts: Record<string, number> = {};
      data.forEach((item: any) => {
        const type = item.type === 'keylog' ? 'Keylogs' :
          item.type === 'screenshot_captured' ? 'Screenshots' : 'Other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const chartTypes = Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value,
        color: name === 'Keylogs' ? '#10b981' : name === 'Screenshots' ? '#3b82f6' : '#f59e0b'
      }));

      // 4. Map the 5 most recent events
      const recent = data.slice(0, 5).map((item: any) => ({
        type: item.type === 'critical' ? 'critical' : item.type === 'screenshot_captured' ? 'warning' : 'info',
        title: item.type === 'keylog' ? 'Keystrokes Captured' :
          item.type === 'screenshot_captured' ? 'Screenshot Captured' : 'Device Activity',
        device: item.device_id || "Unknown",
        time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : "Just now",
        icon: item.type === 'critical' ? Shield : item.type === 'screenshot_captured' ? TrendingUp : Activity
      }));

      setStats({
        totalEvents: data.length,
        activeDevices: devices.size,
        criticalAlerts: criticals,
        onlineRate: devices.size > 0 ? 100 : 0,
        recentEvents: recent,
        activityData: chartActivity,
        threatTypeData: chartTypes
      });
    } catch (err) {
      console.error(err);
      toast.error("Dashboard Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and compliance analytics from AWS
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Captured Events</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : (stats.totalEvents >= 50 ? "50+" : stats.totalEvents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live Cloud Stream
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.activeDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed ID: {stats.activeDevices > 0 ? "Detected" : "None"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.3%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active critical events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Device activity events over 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="events" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>Security events by activity type</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.threatTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.threatTypeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
          <CardDescription>Current compliance scores by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest alerts and notifications from your devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent events recorded</p>
            ) : (
              stats.recentEvents.map((event, index) => {
                const Icon = event.icon;
                const colors = {
                  critical: "text-red-600",
                  warning: "text-orange-600",
                  info: "text-blue-600",
                };

                return (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`mt-1 ${colors[event.type as keyof typeof colors]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Device: {event.device} • {event.time}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
