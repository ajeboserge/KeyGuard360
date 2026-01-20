#!/bin/bash

# KeyGuard360 Quick Start Setup Script
# This script helps set up the multi-device monitoring system

set -e

echo "============================================"
echo "KeyGuard360 Multi-Device Setup"
echo "============================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ from https://www.python.org"
    exit 1
fi

echo "✓ Python version: $(python3 --version)"

# Get AWS credentials
echo ""
echo "AWS Credentials Setup"
echo "Enter your AWS Access Key ID (or press Enter to use environment variable):"
read -r AWS_KEY
echo "Enter your AWS Secret Access Key:"
read -rs AWS_SECRET
echo ""

# Setup Backend
echo "Setting up Backend API..."
cd backend

# Create .env file
cat > .env <<EOF
AWS_ACCESS_KEY_ID=${AWS_KEY:-\$AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET:-\$AWS_SECRET_ACCESS_KEY}
AWS_REGION=us-east-1
DYNAMODB_LOGS_TABLE=keyguard360-logs
DYNAMODB_DEVICES_TABLE=keyguard360-devices
S3_BUCKET=keyguard360-data
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF

echo "✓ Backend .env file created"

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "✓ Backend dependencies already installed"
fi

# Setup Agent
echo ""
echo "Setting up Monitoring Agent..."
cd ../agent

# Create Python virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing agent dependencies..."
pip install -r requirements.txt

# Create agent config
cat > .env <<EOF
AWS_ACCESS_KEY_ID=${AWS_KEY:-\$AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET:-\$AWS_SECRET_ACCESS_KEY}
AWS_REGION=us-east-1
EOF

echo "✓ Agent dependencies installed"

cd ..

echo ""
echo "============================================"
echo "✓ Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Create AWS infrastructure (optional - only need to do once):"
echo "   bash setup-aws.sh"
echo ""
echo "2. Start the Backend API (in one terminal):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start the Monitoring Agent (in another terminal):"
echo "   cd agent"
echo "   source venv/bin/activate"
echo "   python keyguard_agent.py"
echo ""
echo "4. Start the Frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "5. Open browser to http://localhost:5173"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
