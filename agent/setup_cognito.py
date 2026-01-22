import boto3
import sys
import os
from pathlib import Path

# Add the current directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from agent.config import config
except ImportError:
    print("Error: Could not import config. Make sure you are running from the project root.")
    sys.exit(1)

def setup_cognito():
    cognito = boto3.client(
        'cognito-idp',
        aws_access_key_id=config.AWS_ACCESS_KEY,
        aws_secret_access_key=config.AWS_SECRET_KEY,
        region_name=config.AWS_REGION
    )

    print(f"🚀 Starting Cognito setup in {config.AWS_REGION}...")

    try:
        # 1. Create User Pool
        pool_name = "KeyGuard360-UserPool"
        print(f"Creating User Pool: {pool_name}...")
        
        response = cognito.create_user_pool(
            PoolName=pool_name,
            Policies={
                'PasswordPolicy': {
                    'MinimumLength': 8,
                    'RequireUppercase': True,
                    'RequireLowercase': True,
                    'RequireNumbers': True,
                    'RequireSymbols': False
                }
            },
            AutoVerifiedAttributes=['email'],
            UsernameAttributes=['email'],
            MfaConfiguration='OFF'
        )
        
        user_pool_id = response['UserPool']['Id']
        print(f"✅ User Pool Created: {user_pool_id}")

        # 2. Create App Client (NO SECRET for frontend)
        client_name = "KeyGuard360-WebClient"
        print(f"Creating App Client: {client_name}...")
        
        client_response = cognito.create_user_pool_client(
            UserPoolId=user_pool_id,
            ClientName=client_name,
            GenerateSecret=False,
            ExplicitAuthFlows=[
                'ALLOW_USER_PASSWORD_AUTH',
                'ALLOW_REFRESH_TOKEN_AUTH',
                'ALLOW_USER_SRP_AUTH'
            ]
        )
        
        client_id = client_response['UserPoolClient']['ClientId']
        print(f"✅ App Client Created: {client_id}")

        # 3. Update the frontend config file
        config_path = Path("src/app/aws-config.ts")
        if config_path.exists():
            print(f"Updating {config_path}...")
            content = f"""import {{ Amplify }} from 'aws-amplify';

export const configureAmplify = () => {{
  Amplify.configure({{
    Auth: {{
      Cognito: {{
        userPoolId: '{user_pool_id}',
        userPoolClientId: '{client_id}',
        loginWith: {{
          email: true,
        }}
      }}
    }}
  }});
}};
"""
            with open(config_path, "w") as f:
                f.write(content)
            print("✅ Frontend config updated!")
        else:
            print(f"⚠️ Warning: {config_path} not found. You will need to update it manually.")

        print("\n" + "="*50)
        print("🎉 SUCCESS! Cognito is ready.")
        print(f"User Pool ID: {user_pool_id}")
        print(f"Client ID:    {client_id}")
        print("="*50)
        print("\nNext step: Create your first user in the AWS Console or use 'aws cognito-idp admin-create-user'")

    except Exception as e:
        print(f"❌ Error setting up Cognito: {e}")

if __name__ == "__main__":
    setup_cognito()
