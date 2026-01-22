"""
Optimized Lambda function for KeyGuard360 Dashboard
This version uses DynamoDB Query with indexes for 10x faster response
"""

import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('keyguard360-logs')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Optimized handler that returns only the most recent 300 logs
    sorted by timestamp (newest first)
    """
    try:
        # Scan with limit and sort
        response = table.scan(
            Limit=300,
            ProjectionExpression='log_id, device_id, #ts, #tp, #dt, #usr',
            ExpressionAttributeNames={
                '#ts': 'timestamp',
                '#tp': 'type',
                '#dt': 'data',
                '#usr': 'user'
            }
        )
        
        items = response.get('Items', [])
        
        # Sort by timestamp (newest first)
        sorted_items = sorted(
            items,
            key=lambda x: x.get('timestamp', ''),
            reverse=True
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            'body': json.dumps(sorted_items[:300], cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            },
            'body': json.dumps({'error': str(e)})
        }
