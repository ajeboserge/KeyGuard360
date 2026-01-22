# KeyGuard360 - Team Work Breakdown Structure (WBS)
## Project Division for 5 Developers (From Scratch)

---

## 📋 Project Overview

**KeyGuard360** is an AWS-powered enterprise device monitoring and compliance system consisting of:
- **Python Monitoring Agent** - Client-side agent running on employee devices
- **React Dashboard** - Web-based admin interface for device management and analytics
- **AWS Infrastructure** - S3, DynamoDB, SNS, Lambda, and API Gateway integration
- **Security & Compliance** - Threat detection, activity monitoring, and compliance reporting

---

## 👥 Team Structure & Role Assignment

### **Developer 1: Backend Infrastructure Lead (AWS & Python Agent Core)**
**Focus Area:** AWS Infrastructure, Python Agent Core, Backend Services

### **Developer 2: Frontend Lead (React Dashboard & UI)**
**Focus Area:** React Application, UI Components, User Experience

### **Developer 3: Security & Monitoring Features**
**Focus Area:** Security Features, Threat Detection, Activity Monitoring

### **Developer 4: Data Management & Analytics**
**Focus Area:** Data Processing, Analytics, Reporting, Import/Export

### **Developer 5: DevOps & Integration**
**Focus Area:** Deployment, CI/CD, Testing, Documentation, Integration

---

## 🔵 Developer 1: Backend Infrastructure Lead

### **Primary Responsibilities**
- AWS infrastructure setup and management
- Python monitoring agent core functionality
- Backend API development
- Database schema design

### **Sprint 1: AWS Infrastructure Setup (Week 1-2)**

#### Tasks:
1. **AWS Account & IAM Setup**
   - Create AWS account and configure IAM users/roles
   - Set up least-privilege access policies
   - Configure MFA and security settings
   - Create service-specific IAM roles
   - **Deliverables:** IAM policies documentation, access credentials

2. **S3 Bucket Configuration**
   - Create S3 bucket for screenshot storage
   - Configure bucket policies and CORS
   - Set up lifecycle policies for data retention
   - Enable versioning and encryption at rest
   - **Deliverables:** S3 bucket operational, access policies configured

3. **DynamoDB Tables Setup**
   - Design and create `keyguard360-devices` table
   - Design and create `keyguard360-logs` table
   - Configure indexes for efficient querying
   - Set up auto-scaling policies
   - **Deliverables:** Database schema documentation, tables created

4. **SNS Topic Configuration**
   - Create SNS topics for alerts
   - Configure email/SMS subscriptions
   - Set up topic policies
   - Test alert delivery
   - **Deliverables:** SNS topics operational, test alerts working

### **Sprint 2: Python Agent Core (Week 3-4)**

#### Tasks:
1. **Agent Configuration Module (`config.py`)**
   - Create configuration class with AWS credentials
   - Implement environment variable support
   - Add validation for all config parameters
   - Create default configuration template
   - **Files:** `agent/config.py`

2. **Device ID Generation & System Info**
   - Implement unique device ID generation
   - Create system information collection
   - Build CPU, memory, disk monitoring
   - Add platform detection (Windows/Mac/Linux)
   - **Functions:** `_generate_device_id()`, `get_system_info()`

3. **AWS Client Initialization**
   - Set up boto3 clients (S3, DynamoDB, SNS)
   - Implement connection error handling
   - Create retry logic with exponential backoff
   - Add connection testing utility
   - **Files:** `agent/keyguard_agent.py`, `agent/test_connection.py`

4. **Device Status Management**
   - Implement device registration in DynamoDB
   - Create status update mechanism
   - Build heartbeat/keep-alive system
   - Add offline detection and marking
   - **Functions:** `update_device_status()`, `register_device()`

### **Sprint 3: Data Upload & Logging (Week 5-6)**

#### Tasks:
1. **Logging Infrastructure**
   - Set up rotating file logs
   - Implement structured logging
   - Add log levels and filtering
   - Create centralized error handling
   - **Deliverables:** Logging system operational

2. **Activity Log Upload**
   - Implement batch upload to DynamoDB
   - Create activity log formatting
   - Add timestamp normalization (UTC)
   - Build upload queue with retry logic
   - **Functions:** `_log_activity()`, `_upload_batch()`

3. **Screenshot Upload to S3**
   - Initially basic skeleton only (enhanced by Dev 3)
   - S3 upload with proper key structure
   - Implement multipart upload for large files
   - Add metadata tagging
   - **Functions:** Basic `capture_screenshot()` structure

4. **Agent Lifecycle Management**
   - Implement graceful startup/shutdown
   - Create cleanup routines
   - Add signal handlers (SIGTERM, SIGINT)
   - Build process management
   - **Functions:** `run()`, `stop()`, `cleanup()`

---

## 🟢 Developer 2: Frontend Lead

### **Primary Responsibilities**
- React application architecture
- UI component development
- User experience design
- Frontend state management

### **Sprint 1: Project Setup & Core UI (Week 1-2)**

#### Tasks:
1. **React Project Initialization**
   - Set up Vite + React + TypeScript project
   - Configure Tailwind CSS
   - Install UI libraries (Radix UI, shadcn/ui)
   - Set up project structure
   - **Deliverables:** `package.json`, `vite.config.ts`, `tailwind.config.js`

2. **Design System & Theme**
   - Create color palette and design tokens
   - Set up dark/light mode support
   - Build typography system
   - Create spacing and layout utilities
   - **Files:** `src/styles/`

3. **Base UI Components**
   - Button, Input, Card, Badge components
   - Alert, Dialog, Dropdown components
   - Form components (using react-hook-form)
   - Navigation components
   - **Files:** `src/app/components/ui/`

4. **App Shell & Layout**
   - Create main app layout component
   - Build responsive sidebar navigation
   - Implement top bar with actions
   - Add mobile responsive breakpoints
   - **Files:** `src/app/App.tsx`

### **Sprint 2: Authentication & Main Pages (Week 3-4)**

#### Tasks:
1. **Login & Authentication**
   - Build login page UI
   - Create authentication flow
   - Implement form validation
   - Add mock AWS Cognito integration
   - **Files:** `src/app/components/Login.tsx`

2. **Dashboard Page**
   - Create dashboard layout
   - Build statistics cards
   - Add charts (using Recharts)
   - Implement real-time metrics display
   - **Files:** `src/app/components/Dashboard.tsx`

3. **Device List Page**
   - Create device table/grid view
   - Add filtering and search
   - Implement sorting functionality
   - Build device status indicators
   - **Files:** `src/app/components/DeviceList.tsx`

4. **Device Details Modal/Page**
   - Create detailed device view
   - Display system information
   - Show recent activity timeline
   - Add screenshot gallery preview
   - **Files:** `src/app/components/DeviceDetails.tsx`

### **Sprint 3: Advanced UI Components (Week 5-6)**

#### Tasks:
1. **Activity Monitor Page**
   - Build activity timeline view
   - Create log entries display
   - Add real-time updates simulation
   - Implement pagination
   - **Files:** `src/app/components/ActivityMonitor.tsx`

2. **Alerts Panel**
   - Create alerts list with priority sorting
   - Build alert detail view
   - Add alert acknowledgment UI
   - Implement alert filtering
   - **Files:** `src/app/components/AlertsPanel.tsx`

3. **Navigation & Routing**
   - Implement client-side routing
   - Add breadcrumb navigation
   - Create smooth page transitions
   - Build navigation state management
   - **Enhancement:** Upgrade `App.tsx` with routing

4. **Responsive Design Polish**
   - Test and fix mobile layouts
   - Optimize for tablet views
   - Add touch-friendly interactions
   - Implement mobile menu
   - **Deliverables:** Fully responsive UI

---

## 🟡 Developer 3: Security & Monitoring Features

### **Primary Responsibilities**
- Screenshot capture functionality
- Keylogging implementation
- Threat detection system
- Security analytics features

### **Sprint 1: Screenshot Capture System (Week 1-2)**

#### Tasks:
1. **Screenshot Core Implementation**
   - Implement screenshot capture using Pillow/ImageGrab
   - Add platform-specific capture (Windows/Mac/Linux)
   - Build screenshot compression
   - Create configurable capture intervals
   - **Functions:** `capture_screenshot()` - full implementation

2. **Screenshot Upload & Management**
   - Enhance S3 upload with error handling
   - Implement local cache management
   - Add screenshot metadata logging
   - Create cleanup after successful upload
   - **Functions:** `_upload_screenshot()`, `_clean_cache()`

3. **Screenshot Permissions Handling**
   - Add macOS screen recording permission checks
   - Implement Windows elevation detection
   - Create Linux display access handling
   - Build user-friendly permission prompts
   - **Deliverables:** Cross-platform permission handling

4. **Frontend Screenshot Gallery**
   - Create screenshot grid view in dashboard
   - Build image lightbox/modal viewer
   - Add download functionality
   - Implement lazy loading for images
   - **Files:** `src/app/components/ScreenshotGallery.tsx`

### **Sprint 2: Keylogging System (Week 3-4)**

#### Tasks:
1. **Keyboard Listener Implementation**
   - Set up pynput keyboard listener
   - Implement key press event handling
   - Create key stroke buffering system
   - Add platform-specific key mapping
   - **Functions:** `_on_key_press()`, `start_keyboard_listener()`

2. **Keylog Data Processing**
   - Implement sensitive data filtering (passwords)
   - Create structured keylog format
   - Add timestamp precision
   - Build keylog aggregation
   - **Functions:** `_process_keylog()`, `_sanitize_keylog()`

3. **Keylog Upload & Storage**
   - Create batch upload mechanism
   - Implement buffer size management
   - Add encryption for sensitive keylog data
   - Build periodic upload scheduler
   - **Functions:** `_upload_keylogs()`

4. **Keylog Viewer (Frontend)**
   - Create keylog display component
   - Add filtering by time/device
   - Implement search functionality
   - Build export feature
   - **Files:** Addition to `ActivityMonitor.tsx`

### **Sprint 3: Threat Detection & Analytics (Week 5-6)**

#### Tasks:
1. **Keyword-Based Threat Detection**
   - Implement suspicious keyword scanning
   - Create threat severity classification
   - Add real-time threat flagging
   - Build threat alert triggering
   - **Functions:** `_detect_threats()`, `_classify_threat()`

2. **Process Monitoring**
   - Implement running process enumeration
   - Create process whitelist/blacklist
   - Add unauthorized app detection
   - Build process activity logging
   - **Functions:** `get_running_processes()`, `check_suspicious_processes()`

3. **Threat Analytics Dashboard (Frontend)**
   - Create threat analytics page
   - Build threat trend charts
   - Add severity breakdown display
   - Implement threat details modal
   - **Files:** `src/app/components/ThreatAnalytics.tsx`

4. **Real-time Alert System**
   - Enhance SNS alert sending
   - Create alert templates
   - Add alert rate limiting
   - Implement critical threat escalation
   - **Functions:** `_send_alert()` - enhanced version

---

## 🟣 Developer 4: Data Management & Analytics

### **Primary Responsibilities**
- Data export/import functionality
- Compliance reporting
- Analytics and visualization
- Data retention policies

### **Sprint 1: Data Export System (Week 1-2)**

#### Tasks:
1. **Export Script Core**
   - Create export data script (`export_data.py`)
   - Implement DynamoDB data retrieval
   - Add S3 screenshot metadata collection
   - Build JSON export formatting
   - **Files:** `agent/export_data.py`

2. **Export Configuration & CLI**
   - Create CLI argument parsing
   - Add export options (all devices, single device)
   - Implement custom output directory
   - Build export progress tracking
   - **Functions:** `parse_args()`, `export_all()`, `export_device()`

3. **Export Data Structure**
   - Design comprehensive export format
   - Create index.json generation
   - Add metadata and statistics
   - Implement data validation
   - **Deliverables:** Export schema documentation

4. **Export Testing & Validation**
   - Test export with sample data
   - Validate JSON structure
   - Test with multiple devices
   - Create export verification script
   - **Deliverables:** `IMPORT_EXPORT_GUIDE.md` contribution

### **Sprint 2: Data Import System (Week 3-4)**

#### Tasks:
1. **Bulk Import Component (Frontend)**
   - Create bulk import page UI
   - Add folder selection interface
   - Implement file/folder upload
   - Build import progress display
   - **Files:** `src/app/components/BulkImport.tsx`

2. **Import Data Processing**
   - Implement JSON file parsing
   - Create data validation
   - Add duplicate detection
   - Build error handling for malformed data
   - **Functions:** `parseImportFile()`, `validateDeviceData()`

3. **LocalStorage Integration**
   - Store imported devices in localStorage
   - Create data synchronization with mock API
   - Implement data retrieval functions
   - Add cache invalidation
   - **Files:** `src/app/lib/storage.ts` (new)

4. **Import Results & Management**
   - Display import summary statistics
   - Show imported devices list
   - Add clear imported data function
   - Implement selective deletion
   - **Enhancement:** `BulkImport.tsx`

### **Sprint 3: Compliance & Reporting (Week 5-6)**

#### Tasks:
1. **Compliance Reports Page**
   - Create compliance dashboard
   - Build report generation UI
   - Add filtering by date ranges
   - Implement report templates
   - **Files:** `src/app/components/ComplianceReports.tsx`

2. **Data Analytics & Visualization**
   - Create analytics calculation functions
   - Build trend analysis
   - Add device activity metrics
   - Implement usage statistics
   - **Files:** `src/app/lib/analytics.ts` (new)

3. **Report Export Functionality**
   - Implement PDF report generation
   - Create CSV export for data
   - Add Excel export support
   - Build customizable report formats
   - **Functions:** `exportToPDF()`, `exportToCSV()`

4. **Data Retention & Cleanup**
   - Create data retention policy UI
   - Implement automatic cleanup scheduler
   - Add manual data purge options
   - Build retention compliance checks
   - **Deliverables:** Retention policy documentation

---

## 🔴 Developer 5: DevOps & Integration

### **Primary Responsibilities**
- Deployment automation
- Testing infrastructure
- Documentation
- System integration
- CI/CD pipeline

### **Sprint 1: Development Environment & Testing (Week 1-2)**

#### Tasks:
1. **Development Environment Setup**
   - Create development environment guide
   - Set up local testing environment
   - Configure development AWS resources
   - Create environment variable templates
   - **Deliverables:** `DEVELOPMENT.md`

2. **Python Agent Testing**
   - Create unit tests for agent modules
   - Build integration tests for AWS services
   - Add mock AWS clients for testing
   - Implement test data generators
   - **Files:** `agent/tests/` directory

3. **Frontend Testing Setup**
   - Configure testing framework (Vitest)
   - Create component unit tests
   - Build integration tests
   - Add E2E testing setup (Playwright)
   - **Files:** `src/__tests__/` directory

4. **Mock Data Generation**
   - Create sample device data
   - Build mock activity logs
   - Generate test screenshots
   - Create demo compliance data
   - **Files:** `test-data/` directory

### **Sprint 2: Documentation & Guides (Week 3-4)**

#### Tasks:
1. **Main README Enhancement**
   - Create comprehensive README.md
   - Add architecture diagrams
   - Include quick start guide
   - Build feature documentation
   - **Files:** `README.md`

2. **Agent Documentation**
   - Document agent installation
   - Create troubleshooting guide
   - Add platform-specific instructions
   - Build configuration reference
   - **Files:** `agent/README.md`

3. **API & Integration Documentation**
   - Document AWS resource setup
   - Create API reference
   - Add data model documentation
   - Build integration examples
   - **Files:** `API_DOCUMENTATION.md`

4. **Import/Export Guide**
   - Create comprehensive import/export guide
   - Add use case examples
   - Document automation scripts
   - Build backup/restore procedures
   - **Files:** `IMPORT_EXPORT_GUIDE.md`

### **Sprint 3: Deployment & CI/CD (Week 5-6)**

#### Tasks:
1. **Agent Deployment Scripts**
   - Create Windows installer script
   - Build macOS installer package
   - Add Linux systemd service files
   - Create silent installation options
   - **Files:** `deployment/agent/`

2. **Frontend Build & Deployment**
   - Optimize production build
   - Create deployment scripts
   - Set up static hosting (S3 + CloudFront)
   - Configure custom domain
   - **Files:** `deployment/frontend/`

3. **CI/CD Pipeline**
   - Set up GitHub Actions / GitLab CI
   - Create automated testing workflow
   - Add lint and code quality checks
   - Implement automated deployment
   - **Files:** `.github/workflows/` or `.gitlab-ci.yml`

4. **System Integration & E2E Testing**
   - Create end-to-end integration tests
   - Test agent → AWS → dashboard flow
   - Build automated health checks
   - Create system monitoring
   - **Deliverables:** Integration test suite

### **Sprint 4: Documentation Component (Week 7)**

#### Tasks:
1. **System Documentation Component**
   - Create interactive documentation page
   - Add searchable doc sections
   - Build code examples viewer
   - Implement quick reference guides
   - **Files:** `src/app/components/SystemDocs.tsx`

2. **Monitoring Agent Info Page**
   - Create agent download page
   - Add installation wizard UI
   - Build agent configuration helper
   - Implement agent status checker
   - **Files:** `src/app/components/MonitoringAgent.tsx`

3. **Attributions & Legal**
   - Create attributions for licenses
   - Add privacy policy documentation
   - Build terms of service
   - Create compliance notice
   - **Files:** `ATTRIBUTIONS.md`, `LICENSE.md`

4. **Final Integration Testing**
   - Coordinate full system testing
   - Test all integration points
   - Verify data flow end-to-end
   - Create test report
   - **Deliverables:** Final test report and bug fixes

---

## 📅 Timeline Summary

### Phase 1: Foundation (Weeks 1-2)
- **Dev 1:** AWS infrastructure + Agent core
- **Dev 2:** React setup + Basic UI components
- **Dev 3:** Screenshot capture system
- **Dev 4:** Export system design
- **Dev 5:** Dev environment + Testing setup

### Phase 2: Core Features (Weeks 3-4)
- **Dev 1:** Data upload + Logging
- **Dev 2:** Authentication + Main pages
- **Dev 3:** Keylogging system
- **Dev 4:** Import system
- **Dev 5:** Documentation

### Phase 3: Advanced Features (Weeks 5-6)
- **Dev 1:** Agent lifecycle + Optimization
- **Dev 2:** Advanced UI components
- **Dev 3:** Threat detection + Analytics UI
- **Dev 4:** Compliance reporting
- **Dev 5:** Deployment + CI/CD

### Phase 4: Integration & Polish (Week 7)
- All developers coordinate on integration testing
- Bug fixes and optimization
- Final documentation
- Deployment preparation

---

## 🔗 Dependencies & Coordination Points

### Inter-team Dependencies:

1. **Dev 1 ↔ Dev 3:** Screenshot upload mechanism
   - Dev 1 provides S3 upload infrastructure
   - Dev 3 implements capture and uses upload functions

2. **Dev 1 ↔ Dev 4:** Data schema and export
   - Dev 1 defines DynamoDB schema
   - Dev 4 builds export based on schema

3. **Dev 2 ↔ Dev 3:** Security UI components
   - Dev 2 provides base components
   - Dev 3 builds threat analytics using them

4. **Dev 2 ↔ Dev 4:** Import UI and data processing
   - Dev 2 builds UI shell
   - Dev 4 implements data processing logic

5. **Dev 5 ↔ All:** Testing and deployment
   - Dev 5 tests everyone's code
   - All developers fix issues found by Dev 5

### Daily Standup Topics:
- Completed tasks
- Blockers and dependencies
- API contract changes
- Integration testing needs
- Deployment concerns

### Weekly Integration Points:
- **Week 2:** Backend + Frontend integration test
- **Week 4:** Full data flow test (Agent → AWS → Dashboard)
- **Week 6:** End-to-end system test
- **Week 7:** Final integration and deployment

---

## 📊 Success Metrics

### Developer 1 (Backend):
- ✅ All AWS resources provisioned and operational
- ✅ Agent can connect to AWS successfully
- ✅ Data uploads working reliably
- ✅ Device status tracking functional

### Developer 2 (Frontend):
- ✅ All pages responsive and accessible
- ✅ UI components reusable and documented
- ✅ Authentication flow working
- ✅ Dashboard displays real-time data

### Developer 3 (Security):
- ✅ Screenshot capture working on all platforms
- ✅ Keylogging functional with privacy controls
- ✅ Threat detection identifying suspicious activity
- ✅ Security analytics providing insights

### Developer 4 (Data):
- ✅ Export system generating valid data files
- ✅ Import system accepting and validating data
- ✅ Compliance reports accurate and complete
- ✅ Analytics providing actionable insights

### Developer 5 (DevOps):
- ✅ CI/CD pipeline operational
- ✅ All documentation complete and accurate
- ✅ Deployment scripts working
- ✅ Testing coverage >80%

---

## 🛠️ Technology Stack Summary

### Backend (Dev 1 & 3):
- **Language:** Python 3.8+
- **AWS SDK:** boto3
- **Libraries:** psutil, pillow, pynput
- **Storage:** AWS S3, DynamoDB
- **Monitoring:** AWS SNS, CloudWatch

### Frontend (Dev 2 & 4):
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Library:** Radix UI, shadcn/ui
- **Charts:** Recharts
- **Forms:** react-hook-form

### DevOps (Dev 5):
- **Testing:** Vitest, Playwright
- **CI/CD:** GitHub Actions
- **Deployment:** AWS S3 + CloudFront
- **Documentation:** Markdown

---

## 📝 Communication & Collaboration

### Code Review Process:
1. Create feature branch from `main`
2. Implement feature following team standards
3. Write tests (unit + integration)
4. Submit pull request with detailed description
5. At least 1 peer review required
6. CI/CD checks must pass
7. Merge after approval

### Naming Conventions:
- **Branches:** `feature/dev-X-brief-description`
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **PRs:** Include developer number and feature description

### Documentation Standards:
- All functions must have docstrings
- README files for each major component
- Inline comments for complex logic
- API documentation updated with changes

---

## 🎯 Final Deliverables

### Code Artifacts:
- ✅ Python monitoring agent (executable)
- ✅ React dashboard (production build)
- ✅ AWS CloudFormation templates
- ✅ Deployment scripts
- ✅ Test suites

### Documentation:
- ✅ Architecture documentation
- ✅ API reference
- ✅ User guides
- ✅ Admin guides
- ✅ Troubleshooting guides
- ✅ Security documentation

### Operational:
- ✅ CI/CD pipeline
- ✅ Monitoring and alerting
- ✅ Backup and restore procedures
- ✅ Incident response plan

---

**Last Updated:** January 14, 2026  
**Version:** 1.0.0  
**Team Size:** 5 Developers  
**Estimated Timeline:** 6-7 Weeks
