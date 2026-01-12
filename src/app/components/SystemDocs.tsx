import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  FileText, 
  Cloud, 
  Database, 
  Shield, 
  Server,
  Bell,
  Zap,
  Lock,
  CheckCircle,
  Code
} from "lucide-react";

export function SystemDocs() {
  return (
    <div className="space-y-6">
      <div>
        <h1>System Documentation</h1>
        <p className="text-muted-foreground mt-1">
          KeyGuard360 Architecture & Implementation Guide
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>AWS-powered enterprise security and compliance platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            KeyGuard360 is a comprehensive device monitoring and compliance system that collects activity logs 
            from company devices, stores them securely on AWS, runs analytics for threat detection, and generates 
            compliance reports through an admin dashboard.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">User Consent Based</p>
                <p className="text-xs text-muted-foreground">Monitoring runs only with explicit user consent</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Company-Owned Devices</p>
                <p className="text-xs text-muted-foreground">Works exclusively on company-owned hardware</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">End-to-End Encryption</p>
                <p className="text-xs text-muted-foreground">All data encrypted in transit and at rest</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Compliance Ready</p>
                <p className="text-xs text-muted-foreground">GDPR, HIPAA, SOC 2, ISO 27001 compliant</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AWS Services */}
      <Card>
        <CardHeader>
          <CardTitle>AWS Cloud Services</CardTitle>
          <CardDescription>Complete list of AWS services powering the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Cognito */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Lock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Amazon Cognito</h3>
                    <Badge variant="outline">Authentication</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Used for admin authentication, device authentication, and access control policies
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Why Cognito?</strong> Provides secure login, MFA, and JWT tokens—perfect for a monitoring system
                  </div>
                </div>
              </div>
            </div>

            {/* S3 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Amazon S3</h3>
                    <Badge variant="outline">Object Storage</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Used to store screenshots, audio files (if enabled), log archives, and device metadata files
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Why S3?</strong> Highly durable, cheap, scalable, with built-in encryption
                  </div>
                  <div className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                    s3://keyguard360-logs/screenshots/<br />
                    s3://keyguard360-logs/archives/<br />
                    s3://keyguard360-logs/metadata/
                  </div>
                </div>
              </div>
            </div>

            {/* DynamoDB */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Server className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Amazon DynamoDB</h3>
                    <Badge variant="outline">NoSQL Database</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Main database for activity logs, system events, compliance rules, and device registration
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Why DynamoDB?</strong> Serverless, very fast, can handle large volumes of log data
                  </div>
                  <div className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                    Tables: keyguard360-logs, keyguard360-devices, keyguard360-compliance
                  </div>
                </div>
              </div>
            </div>

            {/* Lambda */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">AWS Lambda</h3>
                    <Badge variant="outline">Serverless Compute</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Backend processing: analyze incoming logs, detect suspicious activity, trigger notifications, 
                    create compliance reports, data cleanup and archiving
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Why Lambda?</strong> Serverless and event-driven—perfect for processing log streams
                  </div>
                </div>
              </div>
            </div>

            {/* SNS */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Amazon SNS</h3>
                    <Badge variant="outline">Notifications</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Real-time alerts for suspicious activity, compliance violations, and device offline alerts
                  </p>
                  <div className="text-xs text-muted-foreground mb-2">
                    Alerts can be sent to: Email, SMS, Slack/Webhooks
                  </div>
                </div>
              </div>
            </div>

            {/* API Gateway */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Cloud className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Amazon API Gateway</h3>
                    <Badge variant="outline">REST API</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Secure endpoints for uploading logs, screenshots, device activity updates, and fetching admin reports
                  </p>
                  <div className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                    POST /api/v1/logs/upload<br />
                    POST /api/v1/screenshots/upload<br />
                    GET /api/v1/reports/compliance<br />
                    GET /api/v1/devices/status
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Implementation Status</CardTitle>
          <CardDescription>What's working now vs. what needs AWS integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Completed Features (Mock Data)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Admin login screen with authentication flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Dashboard with real-time metrics and charts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Device management with clickable rows for detailed views</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Device details modal with screenshots, activity timeline, and keylog data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Activity monitoring with filterable log feeds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Threat analytics with AI-powered insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Compliance reports with regulatory framework tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Alerts panel with configurable notification channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Monitoring agent UI with configuration options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>"Sync with AWS" button for simulated data refresh</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Code className="h-4 w-4 text-orange-600" />
                Next Steps for Production
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Replace mock authentication with AWS Cognito integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Implement boto3 for Python agent to upload to S3</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Connect API Gateway endpoints to fetch real data from DynamoDB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Set up Lambda functions for log processing and threat detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Configure SNS topics for real-time alerting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Build Python monitoring agent with system tray integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Implement screenshot capture and keystroke logging (with encryption)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">○</span>
                  <span>Add real-time WebSocket connection for live updates</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>System Architecture</CardTitle>
          <CardDescription>How all components work together</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-6 font-mono text-xs">
            <pre className="whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────┐
│                        KeyGuard360 Architecture                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐          ┌──────────────────────────────────────┐
│  Employee Device │          │           AWS Cloud                  │
│  (Agent Client)  │          │                                      │
│                  │          │  ┌────────────────────────────────┐  │
│  • Screenshot    │──────────┼─▶│      API Gateway               │  │
│  • Keylogging    │  HTTPS   │  │  /api/v1/logs/upload          │  │
│  • File Tracking │          │  │  /api/v1/screenshots/upload   │  │
│  • Activity Logs │          │  └───────────┬────────────────────┘  │
└──────────────────┘          │              │                        │
                              │              ▼                        │
┌──────────────────┐          │  ┌─────────────────────┐             │
│  Admin Dashboard │          │  │   Lambda Functions  │             │
│                  │          │  │  • Process Logs     │             │
│  • Device Mgmt   │◀─────────┼──│  • Threat Detection │             │
│  • Analytics     │  HTTPS   │  │  • Generate Reports │             │
│  • Compliance    │          │  │  • Send Alerts      │             │
│  • Alerts        │          │  └──────────┬──────────┘             │
└──────────────────┘          │             │                        │
                              │             ▼                        │
                              │  ┌──────────────────────────────┐   │
                              │  │       DynamoDB               │   │
                              │  │  • Activity Logs             │   │
                              │  │  • Device Registry           │   │
                              │  │  • Compliance Rules          │   │
                              │  └──────────────────────────────┘   │
                              │                                      │
                              │  ┌──────────────────────────────┐   │
                              │  │         Amazon S3            │   │
                              │  │  • Screenshots               │   │
                              │  │  • Audio Files               │   │
                              │  │  • Log Archives              │   │
                              │  └──────────────────────────────┘   │
                              │                                      │
                              │  ┌──────────────────────────────┐   │
                              │  │      Amazon Cognito          │   │
                              │  │  • Admin Authentication      │   │
                              │  │  • Device Authentication     │   │
                              │  │  • Access Control            │   │
                              │  └──────────────────────────────┘   │
                              │                                      │
                              │  ┌──────────────────────────────┐   │
                              │  │        Amazon SNS            │   │
                              │  │  • Email Alerts              │   │
                              │  │  • SMS Notifications         │   │
                              │  │  • Slack Webhooks            │   │
                              │  └──────────────────────────────┘   │
                              └──────────────────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Compliance */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Privacy & Compliance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-blue-900">
          <p className="mb-3">
            KeyGuard360 is designed with privacy and compliance at its core. The system adheres to 
            industry best practices and regulatory requirements.
          </p>
          <ul className="space-y-2 text-xs">
            <li><strong>User Consent:</strong> Explicit consent obtained before any monitoring begins</li>
            <li><strong>Data Encryption:</strong> TLS 1.3 in transit, AES-256 at rest</li>
            <li><strong>Access Controls:</strong> Role-based access with audit logging</li>
            <li><strong>Data Retention:</strong> Configurable retention policies (default: 90 days)</li>
            <li><strong>Right to Access:</strong> Users can request their own data at any time</li>
            <li><strong>Compliance Standards:</strong> GDPR, CCPA, HIPAA, SOC 2, ISO 27001</li>
            <li><strong>Transparency:</strong> Clear documentation of what is monitored and why</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
