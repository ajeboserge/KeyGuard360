#!/usr/bin/env python3
"""
Test AWS Connection
Quick script to verify AWS credentials and resources are configured correctly
"""

import boto3
from config import Config
import sys


def test_aws_connection():
    """Test AWS connection and resources"""
    config = Config()
    
    print("=" * 60)
    print("KeyGuard360 AWS Connection Test")
    print("=" * 60)
    print()
    
    # Validate config
    print("1️⃣  Validating configuration...")
    if not config.validate():
        print("❌ Configuration validation failed")
        return False
    print("✅ Configuration valid")
    print()
    
    # Test AWS credentials
    print("2️⃣  Testing AWS credentials...")
    try:
        sts = boto3.client(
            'sts',
            aws_access_key_id=config.AWS_ACCESS_KEY,
            aws_secret_access_key=config.AWS_SECRET_KEY,
            region_name=config.AWS_REGION
        )
        identity = sts.get_caller_identity()
        print(f"✅ AWS credentials valid")
        print(f"   Account: {identity['Account']}")
        print(f"   User ARN: {identity['Arn']}")
    except Exception as e:
        print(f"❌ AWS credentials failed: {e}")
        return False
    print()
    
    # Test S3 bucket
    print("3️⃣  Testing S3 bucket...")
    try:
        s3 = boto3.client(
            's3',
            aws_access_key_id=config.AWS_ACCESS_KEY,
            aws_secret_access_key=config.AWS_SECRET_KEY,
            region_name=config.AWS_REGION
        )
        s3.head_bucket(Bucket=config.S3_BUCKET)
        print(f"✅ S3 bucket '{config.S3_BUCKET}' exists and is accessible")
    except Exception as e:
        print(f"❌ S3 bucket test failed: {e}")
        print(f"   Create bucket with: aws s3 mb s3://{config.S3_BUCKET}")
        return False
    print()
    
    # Test DynamoDB tables
    print("4️⃣  Testing DynamoDB tables...")
    try:
        dynamodb = boto3.client(
            'dynamodb',
            aws_access_key_id=config.AWS_ACCESS_KEY,
            aws_secret_access_key=config.AWS_SECRET_KEY,
            region_name=config.AWS_REGION
        )
        
        # Test logs table
        dynamodb.describe_table(TableName=config.DYNAMODB_LOGS_TABLE)
        print(f"✅ DynamoDB table '{config.DYNAMODB_LOGS_TABLE}' exists")
        
        # Test devices table
        dynamodb.describe_table(TableName=config.DYNAMODB_DEVICES_TABLE)
        print(f"✅ DynamoDB table '{config.DYNAMODB_DEVICES_TABLE}' exists")
    except Exception as e:
        print(f"❌ DynamoDB table test failed: {e}")
        print(f"   See README.md for table creation commands")
        return False
    print()
    
    # Test SNS topic (optional)
    print("5️⃣  Testing SNS topic (optional)...")
    try:
        sns = boto3.client(
            'sns',
            aws_access_key_id=config.AWS_ACCESS_KEY,
            aws_secret_access_key=config.AWS_SECRET_KEY,
            region_name=config.AWS_REGION
        )
        sns.get_topic_attributes(TopicArn=config.SNS_TOPIC_ARN)
        print(f"✅ SNS topic exists")
    except Exception as e:
        print(f"⚠️  SNS topic test failed (alerts will not work): {e}")
        print(f"   This is optional, agent will still work")
    print()
    
    print("=" * 60)
    print("🎉 All tests passed! Agent is ready to run.")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Run the agent: python3 keyguard_agent.py")
    print("  2. Check the React dashboard")
    print("  3. Click 'Sync with AWS' in the dashboard")
    print()
    
    return True


if __name__ == '__main__':
    success = test_aws_connection()
    sys.exit(0 if success else 1)
