import { useState, useRef } from "react";
import { Upload, FileJson, CheckCircle, XCircle, FolderOpen, Database } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface ImportedDevice {
  device_id: string;
  hostname: string;
  os: string;
  status: string;
  logs_count: number;
  screenshots_count: number;
}

interface ImportResult {
  success: boolean;
  device_id: string;
  message: string;
  data?: any;
}

export function BulkImport() {
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importedDevices, setImportedDevices] = useState<ImportedDevice[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setImporting(true);
    setImportResults([]);
    const results: ImportResult[] = [];
    const devices: ImportedDevice[] = [];

    toast.loading(`Importing ${files.length} files...`, { id: "import" });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Only process JSON files
      if (!file.name.endsWith('.json')) {
        results.push({
          success: false,
          device_id: file.name,
          message: 'Not a JSON file'
        });
        continue;
      }

      // Skip index.json
      if (file.name === 'index.json') {
        continue;
      }

      try {
        const content = await file.text();
        const data = JSON.parse(content);

        // Validate device data structure
        if (!data.device_id || !data.device_info) {
          results.push({
            success: false,
            device_id: file.name,
            message: 'Invalid device data structure'
          });
          continue;
        }

        // Extract device information
        const device: ImportedDevice = {
          device_id: data.device_id,
          hostname: data.device_info.hostname || 'Unknown',
          os: data.device_info.os || 'Unknown',
          status: data.device_info.status || 'offline',
          logs_count: data.logs?.length || 0,
          screenshots_count: data.screenshots?.length || 0,
        };

        devices.push(device);

        // Store in localStorage (in real app, this would go to a database)
        const storageKey = `device_${data.device_id}`;
        localStorage.setItem(storageKey, JSON.stringify(data));

        results.push({
          success: true,
          device_id: data.device_id,
          message: `Imported ${device.logs_count} logs, ${device.screenshots_count} screenshots`,
          data: data
        });

      } catch (error) {
        results.push({
          success: false,
          device_id: file.name,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    setImportResults(results);
    setImportedDevices(devices);
    setImporting(false);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`Import completed`, {
        id: "import",
        description: `${successCount} devices imported successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      });
    } else {
      toast.error(`Import failed`, {
        id: "import",
        description: `${failCount} files could not be imported`
      });
    }

    // Update global device list
    const event = new CustomEvent('devicesImported', { detail: devices });
    window.dispatchEvent(event);
  };

  const handleFolderSelect = () => {
    folderInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearImportedData = () => {
    // Clear all imported device data from localStorage
    importedDevices.forEach(device => {
      localStorage.removeItem(`device_${device.device_id}`);
    });
    
    setImportedDevices([]);
    setImportResults([]);
    
    toast.success("Cleared all imported data");
    
    // Notify app to refresh
    const event = new CustomEvent('devicesCleared');
    window.dispatchEvent(event);
  };

  const exportSampleFormat = () => {
    const sampleData = {
      device_id: "device-sample123",
      export_timestamp: new Date().toISOString(),
      device_info: {
        device_id: "device-sample123",
        hostname: "Sample-PC",
        os: "Windows 11",
        status: "online",
        last_seen: new Date().toISOString(),
        agent_version: "1.0.0",
        system_info: JSON.stringify({
          cpu_usage: 45.2,
          memory_percent: 62.5,
          disk_percent: 58.3
        })
      },
      logs: [
        {
          log_id: "device-sample123_1704723022000",
          device_id: "device-sample123",
          timestamp: new Date().toISOString(),
          type: "activity",
          data: JSON.stringify({ action: "login", user: "john.doe" })
        }
      ],
      screenshots: [
        {
          key: "screenshots/device-sample123/screenshot_20260108_143022.png",
          size: 524288,
          last_modified: new Date().toISOString(),
          url: "s3://bucket/screenshots/device-sample123/screenshot_20260108_143022.png"
        }
      ],
      stats: {
        total_logs: 1,
        total_screenshots: 1
      }
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'device-sample123.json';
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Sample format downloaded");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Device Import</h2>
          <p className="text-muted-foreground mt-1">
            Import device data from exported JSON files
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Database className="h-4 w-4" />
          {importedDevices.length} devices imported
        </Badge>
      </div>

      {/* Import Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Import from Folder */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Import Folder</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select a folder containing device export files
              </p>
            </div>
            <input
              ref={folderInputRef}
              type="file"
              multiple
              accept=".json"
              onChange={(e) => handleFileImport(e.target.files)}
              className="hidden"
              /* @ts-ignore - webkitdirectory is not in TypeScript types */
              webkitdirectory=""
              directory=""
            />
            <Button 
              onClick={handleFolderSelect}
              disabled={importing}
              className="w-full"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Select Folder
            </Button>
          </div>
        </Card>

        {/* Import Individual Files */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <FileJson className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Import Files</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select individual JSON export files
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json"
              onChange={(e) => handleFileImport(e.target.files)}
              className="hidden"
            />
            <Button 
              onClick={handleFileSelect}
              disabled={importing}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <FileJson className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm">File Format</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Import JSON files exported from the Python agent using <code className="bg-background px-1 py-0.5 rounded">export_data.py</code>
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={exportSampleFormat}
              >
                Download Sample Format
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  toast.info("Run: python3 export_data.py --all", {
                    description: "This will export all devices from AWS to JSON files"
                  });
                }}
              >
                Show Export Command
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Import Results */}
      {importResults.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Import Results</h3>
            <Badge variant="secondary">
              {importResults.filter(r => r.success).length} / {importResults.length} successful
            </Badge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {importResults.map((result, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{result.device_id}</p>
                    <p className="text-xs text-muted-foreground">{result.message}</p>
                  </div>
                </div>
                {result.success && (
                  <Badge variant="outline" className="text-xs">
                    Imported
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Imported Devices List */}
      {importedDevices.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Imported Devices</h3>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={clearImportedData}
            >
              Clear All
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {importedDevices.map((device, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{device.hostname}</h4>
                  <Badge 
                    variant={device.status === 'online' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {device.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{device.os}</p>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Logs:</span>{' '}
                    <span className="font-medium">{device.logs_count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Screenshots:</span>{' '}
                    <span className="font-medium">{device.screenshots_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Usage Instructions */}
      {importedDevices.length === 0 && importResults.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Data Imported Yet</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Select a folder or individual files containing device export data to import
              </p>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">How to export data from Python agent:</h4>
              <div className="bg-muted rounded-lg p-4 text-left max-w-lg mx-auto">
                <code className="text-sm">
                  # Export all devices<br />
                  python3 agent/export_data.py --all<br />
                  <br />
                  # Export specific device<br />
                  python3 agent/export_data.py --device-id device-abc123<br />
                  <br />
                  # Custom output directory<br />
                  python3 agent/export_data.py --all --output /path/to/exports
                </code>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
