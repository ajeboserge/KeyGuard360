import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Monitor, AlertTriangle, CheckCircle, Activity, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAggregatedStats, useActivityTimeline, useAlerts } from "../../hooks/useApi";
import { useEffect, useState } from "react";

const complianceData = [
  { category: "Access Control", score: 98 },
  { category: "Data Protection", score: 95 },
  { category: "Activity Logging", score: 100 },
  { category: "Encryption", score: 92 },
];

export function Dashboard() {
  const { data: stats, loading: statsLoading } = useAggregatedStats();
  const { data: timeline, loading: timelineLoading } = useActivityTimeline(24);
  const { data: alerts, loading: alertsLoading } = useAlerts(50);
  const [threatData, setThreatData] = useState<any[]>([
    { name: "Low", value: 145, color: "#10b981" },
    { name: "Medium", value: 32, color: "#f59e0b" },
    { name: "High", value: 8, color: "#ef4444" },
    { name: "Critical", value: 2, color: "#991b1b" },
  ]);

  // Format timeline data for chart
  const activityData = timeline ? timeline.map((item: any) => ({
    time: new Date(item.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    events: item.events,
  })) : [];

  // Format alerts with time ago
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Real-time monitoring and compliance analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_devices || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">{stats?.active_devices || 0}</span> online
                </p>
              </>
            )}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.active_devices || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.total_devices ? Math.round((stats.active_devices / stats.total_devices) * 100) : 0}% online rate
                </p>
              </>
            )}
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
            {alertsLoading ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{alerts?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-600">{Math.max(0, (alerts?.length || 0) - 35)}</span> in last 24h
                </p>
              </>
            )}
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
            {timelineLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="events" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No activity data available
              </div>
            )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Distribution</CardTitle>
            <CardDescription>Security alerts by severity level</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {alertsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={threatData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {threatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
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
          <CardDescription>Latest alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert: any, index: number) => {
                let icon = AlertTriangle;
                let typeClass = "text-orange-600";
                
                if (alert.type?.includes('error') || alert.type?.includes('critical')) {
                  icon = Shield;
                  typeClass = "text-red-600";
                } else if (alert.type?.includes('info')) {
                  icon = CheckCircle;
                  typeClass = "text-blue-600";
                }

                const Icon = icon;
                
                return (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`mt-1 ${typeClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{alert.data ? JSON.stringify(alert.data).substring(0, 60) : alert.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Device: {alert.device_id || 'System'} • {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No alerts available
            </div>
          )}
      </Card>
    </div>
  );
}
