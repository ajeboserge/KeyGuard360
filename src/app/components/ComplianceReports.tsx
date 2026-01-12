import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  Lock,
  Eye,
  Database,
  Clock
} from "lucide-react";

const complianceScoreData = [
  { category: "Access Control", current: 98, target: 95 },
  { category: "Data Encryption", current: 92, target: 90 },
  { category: "Activity Logging", current: 100, target: 100 },
  { category: "Device Security", current: 87, target: 85 },
  { category: "Network Security", current: 94, target: 90 },
  { category: "Incident Response", current: 89, target: 85 },
];

const radarData = [
  { subject: "GDPR", A: 98, fullMark: 100 },
  { subject: "HIPAA", A: 92, fullMark: 100 },
  { subject: "SOC 2", A: 96, fullMark: 100 },
  { subject: "ISO 27001", A: 94, fullMark: 100 },
  { subject: "PCI DSS", A: 88, fullMark: 100 },
  { subject: "NIST", A: 91, fullMark: 100 },
];

const recentReports = [
  {
    id: "RPT-2026-001",
    title: "Q4 2025 Compliance Audit Report",
    date: "2026-01-03",
    type: "Quarterly",
    status: "completed",
    score: 96.3,
    findings: 3,
  },
  {
    id: "RPT-2025-052",
    title: "December Monthly Security Review",
    date: "2025-12-31",
    type: "Monthly",
    status: "completed",
    score: 94.8,
    findings: 5,
  },
  {
    id: "RPT-2025-051",
    title: "GDPR Compliance Assessment",
    date: "2025-12-28",
    type: "Regulatory",
    status: "completed",
    score: 98.2,
    findings: 2,
  },
  {
    id: "RPT-2025-050",
    title: "SOC 2 Type II Readiness Report",
    date: "2025-12-20",
    type: "Audit",
    status: "completed",
    score: 96.5,
    findings: 4,
  },
  {
    id: "RPT-2026-002",
    title: "January Security Scan",
    date: "2026-01-05",
    type: "Weekly",
    status: "in_progress",
    score: null,
    findings: null,
  },
];

const complianceIssues = [
  {
    id: "ISS-2847",
    severity: "high",
    category: "Data Protection",
    issue: "23 devices missing full-disk encryption",
    affected: "Finance Department",
    dueDate: "2026-01-10",
    status: "open",
  },
  {
    id: "ISS-2848",
    severity: "medium",
    category: "Access Control",
    issue: "Excessive admin privileges detected on 12 accounts",
    affected: "IT Department",
    dueDate: "2026-01-15",
    status: "in_progress",
  },
  {
    id: "ISS-2849",
    severity: "low",
    category: "Activity Logging",
    issue: "Screenshot frequency below policy threshold on 5 devices",
    affected: "Remote Workers",
    dueDate: "2026-01-20",
    status: "open",
  },
  {
    id: "ISS-2850",
    severity: "critical",
    category: "Network Security",
    issue: "Firewall disabled on 2 workstations",
    affected: "Engineering Department",
    dueDate: "2026-01-06",
    status: "open",
  },
];

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
    case "completed":
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
    case "open":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Open</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function ComplianceReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Compliance Reports</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive compliance monitoring and reporting
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.3%</div>
            <Progress value={96.3} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 critical • 5 high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
            <p className="text-xs text-muted-foreground mt-1">
              This year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Q4 2025 Review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score by Category</CardTitle>
            <CardDescription>Current vs. target compliance levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#10b981" name="Current Score" />
                <Bar dataKey="target" fill="#94a3b8" name="Target Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regulatory Framework Compliance</CardTitle>
            <CardDescription>Multi-framework compliance overview</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Compliance Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Generated compliance and audit reports</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg mt-1">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{report.id}</span>
                            <span>•</span>
                            <span>{report.date}</span>
                            <span>•</span>
                            <Badge variant="outline">{report.type}</Badge>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      {report.status === "completed" && (
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Score:</span>
                            <span className="font-medium text-green-600">{report.score}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Findings:</span>
                            <span className="font-medium">{report.findings}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Open Compliance Issues</CardTitle>
          <CardDescription>Items requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {complianceIssues.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className={`h-5 w-5 mt-1 ${
                        issue.severity === 'critical' ? 'text-red-600' :
                        issue.severity === 'high' ? 'text-orange-600' :
                        issue.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{issue.issue}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span>{issue.id}</span>
                              <span>•</span>
                              <span>{issue.category}</span>
                              <span>•</span>
                              <span>Affected: {issue.affected}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(issue.severity)}
                            {getStatusBadge(issue.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Due: </span>
                            <span className="font-medium">{issue.dueDate}</span>
                          </div>
                          <Button size="sm" variant="outline" className="ml-auto">
                            Assign
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
            </TabsContent>

            <TabsContent value="critical">
              <p className="text-sm text-muted-foreground">Showing critical severity issues only</p>
            </TabsContent>

            <TabsContent value="high">
              <p className="text-sm text-muted-foreground">Showing high severity issues only</p>
            </TabsContent>

            <TabsContent value="medium">
              <p className="text-sm text-muted-foreground">Showing medium severity issues only</p>
            </TabsContent>

            <TabsContent value="low">
              <p className="text-sm text-muted-foreground">Showing low severity issues only</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
