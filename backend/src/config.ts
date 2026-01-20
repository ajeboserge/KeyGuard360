import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

export const dynamodb = new AWS.DynamoDB.DocumentClient();
export const s3 = new AWS.S3();

export const TABLES = {
  LOGS: process.env.DYNAMODB_LOGS_TABLE || 'keyguard360-logs',
  DEVICES: process.env.DYNAMODB_DEVICES_TABLE || 'keyguard360-devices',
};

export const S3_BUCKET = process.env.S3_BUCKET || 'keyguard360-data';
