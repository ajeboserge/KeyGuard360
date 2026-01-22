import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Monitor,
  Activity,
  Shield,
  FileText,
  Bell,
  Menu,
  X,
  RefreshCw,
  Laptop,
  BookOpen,
  FolderInput,
  LogOut
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { DeviceList } from "./components/DeviceList";
import { ActivityMonitor } from "./components/ActivityMonitor";
import { ThreatAnalytics } from "./components/ThreatAnalytics";
import { ComplianceReports } from "./components/ComplianceReports";
import { AlertsPanel } from "./components/AlertsPanel";
import { MonitoringAgent } from "./components/MonitoringAgent";
import { SystemDocs } from "./components/SystemDocs";
import { BulkImport } from "./components/BulkImport";
import { Login } from "./components/Login";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

type NavigationItem = {
  id: string;
  label: string;
  icon: any;
  component: React.ComponentType;
  badge?: number;
};

const navigation: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, component: Dashboard },
  { id: "devices", label: "Devices", icon: Monitor, component: DeviceList },
  { id: "activity", label: "Activity Monitor", icon: Activity, component: ActivityMonitor },
  { id: "threats", label: "Threat Analytics", icon: Shield, component: ThreatAnalytics },
  { id: "compliance", label: "Compliance", icon: FileText, component: ComplianceReports },
  { id: "alerts", label: "Alerts", icon: Bell, component: AlertsPanel, badge: 42 },
  { id: "agent", label: "Monitoring Agent", icon: Laptop, component: MonitoringAgent },
  { id: "import", label: "Bulk Import", icon: FolderInput, component: BulkImport },
  { id: "docs", label: "Documentation", icon: BookOpen, component: SystemDocs },
];

import { signOut, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setIsAuthenticated(true);
        setUser(attributes.email || "Admin User");
      } catch (err) {
        // Not logged in
      } finally {
        setIsInitialLoading(false);
      }
    };
    checkUser();
  }, []);

  const ActiveComponent = navigation.find(item => item.id === activeTab)?.component || Dashboard;

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setUser(username);
    toast.success(`Welcome back, ${username}!`, {
      description: "Successfully authenticated via AWS Cognito",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
      toast.success("Signed out successfully");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    toast.loading("Syncing with AWS services...", { id: "sync" });

    // Simulate AWS sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success("Sync completed successfully", {
      id: "sync",
      description: "Retrieved latest data from DynamoDB, S3, and Lambda",
    });
    setIsSyncing(false);
  };

  // Show loading while checking initial auth status
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">Initializing security platform...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster />
      {/* Sidebar - Fixed Position */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r bg-card flex-shrink-0 overflow-hidden fixed left-0 top-0 h-screen z-20`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">KeyGuard360</h1>
                <p className="text-xs text-muted-foreground">Enterprise Security</p>
              </div>
            </div>
          </div>

          {/* Admin Info - Moved to top */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="bg-accent rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold uppercase">
                  {user?.substring(0, 2) || "AD"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user || "Admin User"}</p>
                  <p className="text-xs text-muted-foreground truncate">Cognito Authenticated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant={isActive ? "secondary" : "default"} className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout at bottom */}
          <div className="p-4 border-t flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h2 className="font-semibold">KeyGuard360 Security Platform</h2>
              <p className="text-xs text-muted-foreground">AWS-Powered Device Monitoring &amp; Compliance</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync with AWS
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">All Systems Operational</span>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              AWS Connected
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
}