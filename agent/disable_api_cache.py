#!/usr/bin/env python3
"""
Disable API Gateway caching for instant dashboard updates
"""
import boto3
from config import config

def disable_api_cache():
    """Disable caching on the API Gateway to get real-time updates"""
    client = boto3.client(
        'apigateway',
        aws_access_key_id=config.AWS_ACCESS_KEY,
        aws_secret_access_key=config.AWS_SECRET_KEY,
        region_name=config.AWS_REGION
    )
    
    # Your API Gateway ID (extracted from your API URL)
    api_id = 'cw5b26zcta'
    stage_name = 'prod'
    
    try:
        print(f"🔧 Disabling cache on API Gateway: {api_id}")
        
        # Update stage settings to disable caching
        response = client.update_stage(
            restApiId=api_id,
            stageName=stage_name,
            patchOperations=[
                {
                    'op': 'replace',
                    'path': '/*/*/caching/enabled',
                    'value': 'false'
                },
                {
                    'op': 'replace',
                    'path': '/*/*/caching/ttlInSeconds',
                    'value': '0'
                }
            ]
        )
        
        print("✅ API Gateway cache disabled successfully!")
        print("📊 Dashboard will now show updates within 1-2 seconds")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Alternative: You can disable caching manually in AWS Console:")
        print(f"   1. Go to API Gateway > {api_id} > Stages > {stage_name}")
        print("   2. Click 'Settings' tab")
        print("   3. Uncheck 'Enable API cache'")
        print("   4. Click 'Save Changes'")

if __name__ == '__main__':
    disable_api_cache()
