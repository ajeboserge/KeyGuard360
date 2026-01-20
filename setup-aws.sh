#!/bin/bash

# KeyGuard360 AWS Infrastructure Setup Script
# Creates DynamoDB tables, S3 bucket, and IAM user

set -e

echo "============================================"
echo "KeyGuard360 AWS Infrastructure Setup"
echo "============================================"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Install from: https://aws.amazon.com/cli/"
    exit 1
fi

echo "✓ AWS CLI found"

# Check if authenticated
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Not authenticated with AWS. Run 'aws configure'"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${1:-us-east-1}

echo "✓ Authenticated as: $ACCOUNT_ID"
echo "✓ Region: $REGION"
echo ""

# Create DynamoDB tables
echo "Creating DynamoDB tables..."

# Devices table
echo "  - Creating keyguard360-devices table..."
aws dynamodb create-table \
  --table-name keyguard360-devices \
  --attribute-definitions \
    AttributeName=device_id,AttributeType=S \
  --key-schema \
    AttributeName=device_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION 2>/dev/null || echo "    ℹ Table already exists"

# Logs table with GSI
echo "  - Creating keyguard360-logs table..."
aws dynamodb create-table \
  --table-name keyguard360-logs \
  --attribute-definitions \
    AttributeName=log_id,AttributeType=S \
    AttributeName=device_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=log_id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=device_id-timestamp-index,\
    KeySchema=[{AttributeName=device_id,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],\
    Projection={ProjectionType=ALL},\
    ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION 2>/dev/null || echo "    ℹ Table already exists"

echo "✓ DynamoDB tables ready"
echo ""

# Create S3 bucket
echo "Creating S3 bucket..."
BUCKET_NAME="keyguard360-data-${ACCOUNT_ID}"

aws s3 mb "s3://$BUCKET_NAME" --region $REGION 2>/dev/null || echo "  ℹ Bucket already exists"

echo "✓ S3 bucket ready: $BUCKET_NAME"
echo ""

# Create IAM user (optional)
read -p "Create IAM user for agents? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating IAM user..."
    
    # Create user
    aws iam create-user --user-name keyguard360-agent 2>/dev/null || echo "  ℹ User already exists"
    
    # Attach policies
    echo "  - Attaching DynamoDB policy..."
    aws iam attach-user-policy \
      --user-name keyguard360-agent \
      --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
    
    echo "  - Attaching S3 policy..."
    aws iam attach-user-policy \
      --user-name keyguard360-agent \
      --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
    
    # Create access keys
    echo "  - Creating access keys..."
    ACCESS_KEYS=$(aws iam create-access-key --user-name keyguard360-agent 2>/dev/null || echo "")
    
    if [ -z "$ACCESS_KEYS" ]; then
        echo "  ℹ Access key already exists for this user"
        echo "  Use existing keys or delete old ones with:"
        echo "    aws iam list-access-keys --user-name keyguard360-agent"
    else
        ACCESS_KEY=$(echo $ACCESS_KEYS | grep -o '"AccessKeyId": "[^"]*' | cut -d'"' -f4)
        SECRET_KEY=$(echo $ACCESS_KEYS | grep -o '"SecretAccessKey": "[^"]*' | cut -d'"' -f4)
        
        echo ""
        echo "✓ IAM user created successfully!"
        echo ""
        echo "Save these credentials (they won't be shown again):"
        echo "  Access Key ID: $ACCESS_KEY"
        echo "  Secret Access Key: $SECRET_KEY"
        echo ""
        echo "Add to your config.py or environment variables:"
        echo "  AWS_ACCESS_KEY_ID=$ACCESS_KEY"
        echo "  AWS_SECRET_ACCESS_KEY=$SECRET_KEY"
    fi
fi

echo ""
echo "============================================"
echo "✓ AWS Infrastructure Ready!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Configure agent/config.py with AWS credentials"
echo "  2. Update backend/.env with AWS settings"
echo "  3. Run: npm run dev (from backend/)"
echo "  4. Run: python keyguard_agent.py (from agent/)"
echo ""
