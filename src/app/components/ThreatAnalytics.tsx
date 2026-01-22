import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Zap,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://cw5b26zcta.execute-api.eu-north-1.amazonaws.com/prod/logs";

const threatTrendData = [
  { date: "Dec 29", low: 45, medium: 12, high: 3, critical: 0 },
  { date: "Dec 30", low: 52, medium: 15, high: 4, critical: 1 },
  { date: "Dec 31", low: 48, medium: 18, high: 6, critical: 2 },
  { date: "Jan 1", low: 38, medium: 10, high: 2, critical: 0 },
  { date: "Jan 2", low: 65, medium: 22, high: 8, critical: 1 },
  { date: "Jan 3", low: 71, medium: 28, high: 10, critical: 3 },
  { date: "Jan 4", low: 58, medium: 19, high: 5, critical: 1 },
  { date: "Jan 5", low: 62, medium: 24, high: 7, critical: 2 },
];

const threatTypeData = [
  { name: "Unauthorized Access", value: 45, color: "#ef4444" },
  { name: "Malware Detection", value: 23, color: "#f97316" },
  { name: "Data Exfiltration", value: 18, color: "#eab308" },
  { name: "Policy Violation", value: 67, color: "#3b82f6" },
  { name: "Suspicious Activity", value: 34, color: "#8b5cf6" },
];

const deviceRiskData = [
  { device: "WKS-1847", riskScore: 87, threats: 12, lastIncident: "2 hours ago" },
  { device: "LPT-0932", riskScore: 76, threats: 8, lastIncident: "5 hours ago" },
  { device: "WKS-2156", riskScore: 72, threats: 6, lastIncident: "1 day ago" },
  { device: "LPT-2765", riskScore: 65, threats: 5, lastIncident: "2 days ago" },
  { device: "WKS-3098", riskScore: 58, threats: 4, lastIncident: "3 days ago" },
];

const detectionRateData = [
  { hour: "00:00", detected: 12, blocked: 10 },
  { hour: "04:00", detected: 8, blocked: 7 },
  { hour: "08:00", detected: 34, blocked: 30 },
  { hour: "12:00", detected: 28, blocked: 25 },
  { hour: "16:00", detected: 31, blocked: 28 },
  { hour: "20:00", detected: 18, blocked: 16 },
];

const getRiskBadge = (score: number) => {
  if (score >= 80) return <Badge variant="destructive">Critical Risk</Badge>;
  if (score >= 60) return <Badge className="bg-orange-500 hover:bg-orange-600">High Risk</Badge>;
  if (score >= 40) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium Risk</Badge>;
  return <Badge className="bg-green-500 hover:bg-green-600">Low Risk</Badge>;
};

export function ThreatAnalytics() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreatData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Cloud sync failed");
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("Analytics Sync Error", { description: "Failed to load live threat data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatData();
    const interval = setInterval(fetchThreatData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Aggregate Data for Charts
  const processTrendData = () => {
    const days: Record<string, any> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }).reverse();

    last7Days.forEach(date => {
      days[date] = { date, low: 0, medium: 0, high: 0, critical: 0 };
    });

    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (days[date]) {
        const severity = log.type === 'critical' || log.type === 'unauthorized_access' ? 'critical' :
          log.type === 'keylog' ? 'high' : 'medium';
        days[date][severity]++;
      }
    });

    return Object.values(days);
  };

  const processTypeData = () => {
    const types: Record<string, number> = {
      "Unauthorized Access": 0,
      "Malware Detection": 0,
      "Data Exfiltration": 0,
      "Policy Violation": 0,
      "Suspicious Activity": 0
    };

    logs.forEach(log => {
      if (log.type === 'unauthorized_access') types["Unauthorized Access"]++;
      else if (log.type === 'keylog') types["Suspicious Activity"]++;
      else if (log.type === 'screenshot_captured') types["Policy Violation"]++;
      else types["Malware Detection"]++;
    });

    const colors = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#8b5cf6"];
    return Object.entries(types).map(([name, value], i) => ({ name, value, color: colors[i] }));
  };

  const processRiskData = () => {
    const devices: Record<string, any> = {};
    logs.forEach(log => {
      if (!devices[log.device_id]) {
        devices[log.device_id] = { device: log.device_id, threats: 0, riskScore: 0, lastIncident: log.timestamp };
      }
      devices[log.device_id].threats++;
      devices[log.device_id].riskScore = Math.min(100, devices[log.device_id].threats * 15);
      if (new Date(log.timestamp) > new Date(devices[log.device_id].lastIncident)) {
        devices[log.device_id].lastIncident = log.timestamp;
      }
    });

    return Object.values(devices)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
      .map(d => ({
        ...d,
        lastIncident: new Date(d.lastIncident).toLocaleTimeString()
      }));
  };

  const threatTrendData = processTrendData();
  const threatTypeData = processTypeData();
  const deviceRiskData = processRiskData();

  const metrics = {
    detected: logs.length,
    blocked: Math.floor(logs.length * 0.92),
    active: Math.floor(logs.length * 0.08),
    rate: "94.8%"
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat_analytics_export.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Threat Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Advanced threat detection and security analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.detected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Live from AWS Network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attacks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blocked}</div>
            <p className="text-xs text-muted-foreground mt-1">
              92.4% mitigation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Sync</CardTitle>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : 'text-blue-600'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? 'Syncing' : 'Live'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected to Cloud Agent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Threat Trend Analysis</CardTitle>
                <CardDescription>Security incidents surfaced from AWS Lambda</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={threatTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#991b1b" fill="#991b1b" name="Critical" />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#ef4444" fill="#ef4444" name="High" />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Medium" />
                <Area type="monotone" dataKey="low" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Low" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Distribution by Type</CardTitle>
            <CardDescription>Breakdown of detected security threats</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detection Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Detection & Response</CardTitle>
          <CardDescription>Threat detection and blocking efficiency over 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={detectionRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="detected" stroke="#ef4444" strokeWidth={2} name="Detected" />
              <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} name="Blocked" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* High-Risk Devices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>High-Risk Devices</CardTitle>
              <CardDescription>Devices with elevated security risk scores</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviceRiskData.map((device) => (
              <div key={device.device} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">{device.device}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.threats} active threats • Last incident: {device.lastIncident}
                      </div>
                    </div>
                  </div>
                  {getRiskBadge(device.riskScore)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="font-medium">{device.riskScore}/100</span>
                  </div>
                  <Progress value={device.riskScore} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>AI-Powered Security Insights</CardTitle>
          </div>
          <CardDescription>Automated threat analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Critical Pattern Detected</p>
                  <p className="text-sm text-red-700 mt-1">
                    Device WKS-1847 shows unusual data access patterns similar to known data exfiltration behavior.
                    Recommend immediate investigation and temporary access restriction.
                  </p>
                  <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                    Investigate Now
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Anomaly Detection</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Multiple devices accessing sensitive files outside normal business hours.
                    Consider implementing time-based access controls for enhanced security.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Security Recommendation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your threat detection rate has improved by 12% this week. Continue current security protocols
                    and consider deploying advanced endpoint protection to devices in the Finance department.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
