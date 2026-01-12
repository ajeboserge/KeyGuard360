#!/usr/bin/env python3
"""
Export Device Data
Exports device data from AWS to JSON files for backup, migration, or bulk import
"""

import boto3
import json
import os
from datetime import datetime
from pathlib import Path
from config import Config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('DataExporter')


class DeviceDataExporter:
    """Export device data from AWS to local files"""
    
    def __init__(self, config: Config):
        self.config = config
        
        # AWS clients
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=config.AWS_ACCESS_KEY,
            aws_secret_access_key=config.AWS_SECRET_KEY,
            region_name=config.AWS_REGION
        )
        self.dynamodb = boto3.resource(
            'dynamodb',
            aws_access_key_id=config.AWS_ACCESS_KEY,
            aws_secret_access_key=config.AWS_SECRET_KEY,
            region_name=config.AWS_REGION
        )
        
        self.devices_table = self.dynamodb.Table(config.DYNAMODB_DEVICES_TABLE)
        self.logs_table = self.dynamodb.Table(config.DYNAMODB_LOGS_TABLE)
    
    def export_all_devices(self, output_dir='./exports'):
        """Export all devices to individual JSON files"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        logger.info(f"Exporting all devices to {output_dir}")
        
        # Get all devices
        try:
            response = self.devices_table.scan()
            devices = response.get('Items', [])
            
            logger.info(f"Found {len(devices)} devices")
            
            for device in devices:
                device_id = device.get('device_id')
                self.export_device(device_id, output_dir)
            
            # Create index file
            self._create_index(devices, output_dir)
            
            logger.info(f"✅ Export completed: {len(devices)} devices exported")
            return len(devices)
            
        except Exception as e:
            logger.error(f"Error exporting devices: {e}")
            return 0
    
    def export_device(self, device_id: str, output_dir='./exports'):
        """Export single device data to JSON file"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        logger.info(f"Exporting device: {device_id}")
        
        try:
            # Get device info
            device_response = self.devices_table.get_item(Key={'device_id': device_id})
            device_data = device_response.get('Item', {})
            
            # Get device logs
            logs_response = self.logs_table.scan(
                FilterExpression='device_id = :device_id',
                ExpressionAttributeValues={':device_id': device_id}
            )
            logs = logs_response.get('Items', [])
            
            # Get screenshots from S3
            screenshots = self._get_device_screenshots(device_id)
            
            # Create export data
            export_data = {
                'device_id': device_id,
                'export_timestamp': datetime.utcnow().isoformat(),
                'device_info': device_data,
                'logs': logs,
                'screenshots': screenshots,
                'stats': {
                    'total_logs': len(logs),
                    'total_screenshots': len(screenshots)
                }
            }
            
            # Write to file
            filename = output_path / f"{device_id}.json"
            with open(filename, 'w') as f:
                json.dump(export_data, f, indent=2, default=str)
            
            logger.info(f"✅ Exported {device_id}: {len(logs)} logs, {len(screenshots)} screenshots")
            
        except Exception as e:
            logger.error(f"Error exporting device {device_id}: {e}")
    
    def _get_device_screenshots(self, device_id: str):
        """Get list of screenshots for a device from S3"""
        try:
            prefix = f"screenshots/{device_id}/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.config.S3_BUCKET,
                Prefix=prefix
            )
            
            screenshots = []
            for obj in response.get('Contents', []):
                screenshots.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'].isoformat(),
                    'url': f"s3://{self.config.S3_BUCKET}/{obj['Key']}"
                })
            
            return screenshots
            
        except Exception as e:
            logger.error(f"Error getting screenshots for {device_id}: {e}")
            return []
    
    def _create_index(self, devices, output_dir):
        """Create index file listing all exported devices"""
        index_data = {
            'export_timestamp': datetime.utcnow().isoformat(),
            'total_devices': len(devices),
            'devices': [
                {
                    'device_id': d.get('device_id'),
                    'hostname': d.get('hostname'),
                    'os': d.get('os'),
                    'status': d.get('status'),
                    'last_seen': d.get('last_seen'),
                    'filename': f"{d.get('device_id')}.json"
                }
                for d in devices
            ]
        }
        
        filename = Path(output_dir) / 'index.json'
        with open(filename, 'w') as f:
            json.dump(index_data, f, indent=2, default=str)
        
        logger.info(f"Created index file: {filename}")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Export device data from AWS')
    parser.add_argument('--device-id', help='Export specific device ID')
    parser.add_argument('--output', default='./exports', help='Output directory')
    parser.add_argument('--all', action='store_true', help='Export all devices')
    
    args = parser.parse_args()
    
    config = Config()
    if not config.validate():
        logger.error("Invalid configuration")
        return
    
    exporter = DeviceDataExporter(config)
    
    if args.all:
        count = exporter.export_all_devices(args.output)
        print(f"\n✅ Exported {count} devices to {args.output}/")
    elif args.device_id:
        exporter.export_device(args.device_id, args.output)
        print(f"\n✅ Exported device {args.device_id} to {args.output}/")
    else:
        print("Usage:")
        print("  Export all devices:     python3 export_data.py --all")
        print("  Export specific device: python3 export_data.py --device-id device-abc123")
        print("  Custom output dir:      python3 export_data.py --all --output /path/to/dir")


if __name__ == '__main__':
    main()
