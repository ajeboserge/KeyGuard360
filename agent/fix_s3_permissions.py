import boto3
import sys
import os

# Add the current directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from agent.config import config
except ImportError:
    print("Error: Could not import config. Make sure you are running from the project root.")
    sys.exit(1)

def fix_s3_permissions():
    s3 = boto3.client(
        's3',
        aws_access_key_id=config.AWS_ACCESS_KEY,
        aws_secret_access_key=config.AWS_SECRET_KEY,
        region_name=config.AWS_REGION
    )

    bucket_name = config.S3_BUCKET
    print(f"🛠️  Fixing permissions for bucket: {bucket_name}...")

    try:
        # 1. Disable "Block Public Access"
        print("🔓 Disabling 'Block Public Access'...")
        s3.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )

        # 2. Enable ACLs
        print("📜 Enabling ACLs (Object Ownership)...")
        s3.put_bucket_ownership_controls(
            Bucket=bucket_name,
            OwnershipControls={
                'Rules': [
                    {
                        'ObjectOwnership': 'BucketOwnerPreferred'
                    },
                ]
            }
        )

        # 3. Apply Bucket Policy for public read on screenshots
        print("📁 Applying Public Read policy for screenshots/ folder...")
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/screenshots/*"
                }
            ]
        }
        import json
        s3.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(policy)
        )

        # 4. Fix existing objects (Optional but helpful)
        print("🖼️  Updating permissions for existing screenshots...")
        paginator = s3.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=bucket_name, Prefix='screenshots/'):
            if 'Contents' in page:
                for obj in page['Contents']:
                    s3.put_object_acl(
                        ACL='public-read',
                        Bucket=bucket_name,
                        Key=obj['Key']
                    )

        print("\n" + "="*50)
        print("🎉 SUCCESS! S3 screenshots are now public.")
        print("="*50)
        print("\nTry refreshing your dashboard now. The images should appear!")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nTip: Ensure your IAM user has 's3:PutBucketPolicy' and 's3:PutBucketPublicAccessBlock' permissions.")

if __name__ == "__main__":
    fix_s3_permissions()
