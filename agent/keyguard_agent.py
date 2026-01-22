#!/usr/bin/env python3
"""
KeyGuard360 Monitoring Agent
Client-side monitoring agent that runs on employee devices with consent.
Uploads screenshots, activity logs, and system data to AWS.
"""

import boto3
import json
import platform
import psutil
import time
import hashlib
import os
from datetime import datetime, UTC
from PIL import ImageGrab
from pynput import keyboard
import threading
import logging
from pathlib import Path

# Import configuration
from config import Config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('keyguard_agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('KeyGuard360')


class CloudWatchLogHandler(logging.Handler):
    """Custom logging handler to send logs to AWS CloudWatch"""
    def __init__(self, logs_client, log_group, log_stream):
        super().__init__()
        self.client = logs_client
        self.log_group = log_group
        self.log_stream = log_stream
        self.sequence_token = None
        self._setup_logs()

    def _setup_logs(self):
        """Ensure log group and stream exist"""
        try:
            # Try to create log group
            try:
                self.client.create_log_group(logGroupName=self.log_group)
            except self.client.exceptions.ResourceAlreadyExistsException:
                pass
            
            # Try to create log stream
            try:
                self.client.create_log_stream(
                    logGroupName=self.log_group,
                    logStreamName=self.log_stream
                )
            except self.client.exceptions.ResourceAlreadyExistsException:
                pass
        except Exception as e:
            print(f"Failed to setup CloudWatch logs: {e}")

    def emit(self, record):
        try:
            message = self.format(record)
            timestamp = int(record.created * 1000)
            
            params = {
                'logGroupName': self.log_group,
                'logStreamName': self.log_stream,
                'logEvents': [{
                    'timestamp': timestamp,
                    'message': message
                }]
            }
            
            if self.sequence_token:
                params['sequenceToken'] = self.sequence_token
                
            response = self.client.put_log_events(**params)
            self.sequence_token = response.get('nextSequenceToken')
        except Exception:
            # Don't let logging failures crash the agent
            pass


class KeyGuardAgent:
    """Main monitoring agent class"""
    
    def __init__(self, config: Config):
        self.config = config
        self.device_id = self._generate_device_id()
        self.running = False
        self.keylog_buffer = []
        self.screenshot_count = 0
        
        # AWS clients
        try:
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
            self.sns_client = boto3.client(
                'sns',
                aws_access_key_id=config.AWS_ACCESS_KEY,
                aws_secret_access_key=config.AWS_SECRET_KEY,
                region_name=config.AWS_REGION
            )
            self.logs_client = boto3.client(
                'logs',
                aws_access_key_id=config.AWS_ACCESS_KEY,
                aws_secret_access_key=config.AWS_SECRET_KEY,
                region_name=config.AWS_REGION
            )
            
            # CloudWatch Logging setup
            if config.ENABLE_CLOUDWATCH_LOGGING:
                cw_handler = CloudWatchLogHandler(
                    self.logs_client, 
                    config.CLOUDWATCH_LOG_GROUP,
                    f"agent-{self.device_id}"
                )
                cw_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
                logger.addHandler(cw_handler)
                logger.info("CloudWatch logging enabled")
            
            # DynamoDB tables
            self.logs_table = self.dynamodb.Table(config.DYNAMODB_LOGS_TABLE)
            self.devices_table = self.dynamodb.Table(config.DYNAMODB_DEVICES_TABLE)
            
            logger.info(f"AWS clients initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {e}")
            raise
        
        # Create local cache directory
        self.cache_dir = Path('./cache')
        self.cache_dir.mkdir(exist_ok=True)
        
        logger.info(f"Agent initialized for device: {self.device_id}")
    
    def _generate_device_id(self):
        """Generate unique device ID based on hardware"""
        # Use hostname and MAC address to create unique ID
        hostname = platform.node()
        try:
            import uuid
            mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) 
                           for elements in range(0, 8*6, 8)][::-1])
            unique_string = f"{hostname}-{mac}"
        except:
            unique_string = hostname
        
        device_hash = hashlib.md5(unique_string.encode()).hexdigest()[:12]
        return f"device-{device_hash}"

    def get_location_info(self):
        """Get geographical location based on public IP"""
        try:
            import urllib.request
            import json
            # Using a free, no-key-required geolocation API
            with urllib.request.urlopen('http://ip-api.com/json/', timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('status') == 'success':
                    city = data.get('city', 'Unknown City')
                    region = data.get('regionName', '')
                    country = data.get('country', 'Unknown Country')
                    return f"{city}, {country}" if not region else f"{city} ({region}), {country}"
        except Exception:
            pass
        return "Remote Entry"

    def get_public_ip(self):
        """Get the actual public IP address of the device"""
        try:
            import urllib.request
            return urllib.request.urlopen('https://api.ipify.org', timeout=5).read().decode('utf8')
        except:
            return None
    
    def get_system_info(self):
        """Collect system information"""
        try:
            import getpass
            import socket
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Get Public IP and Location
            public_ip = self.get_public_ip()
            location = self.get_location_info()
            
            # Get Internal IP for technical logs
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                internal_ip = s.getsockname()[0]
                s.close()
            except:
                internal_ip = "127.0.0.1"
            
            return {
                'device_id': self.device_id,
                'hostname': platform.node(),
                'user': getpass.getuser(),
                'ip_address': public_ip or internal_ip,
                'internal_ip': internal_ip,
                'location': location,
                'os': f"{platform.system()} {platform.release()}",
                'platform': platform.platform(),
                'processor': platform.processor(),
                'cpu_usage': cpu_percent,
                'memory_total_gb': round(memory.total / (1024**3), 2),
                'memory_used_gb': round(memory.used / (1024**3), 2),
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
                'timestamp': datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
            }
        except Exception as e:
            logger.error(f"Error collecting system info: {e}")
            return {}
    
    def capture_screenshot(self):
        """Capture and upload screenshot to S3"""
        if not self.config.ENABLE_SCREENSHOTS:
            return
        
        try:
            timestamp = datetime.now(UTC).strftime('%Y%m%d_%H%M%S')
            filename = f"{self.device_id}_screenshot_{timestamp}.png"
            local_path = self.cache_dir / filename
            
            # Capture screenshot
            screenshot = ImageGrab.grab()
            screenshot.save(local_path, 'PNG')
            
            # Upload to S3
            s3_key = f"screenshots/{self.device_id}/{filename}"
            self.s3_client.upload_file(
                str(local_path),
                self.config.S3_BUCKET,
                s3_key,
                ExtraArgs={
                    'ContentType': 'image/png'
                }
            )
            
            logger.info(f"Screenshot uploaded: {s3_key}")
            
            # Clean up local file
            if self.config.DELETE_LOCAL_CACHE:
                local_path.unlink()
            
            # Log to DynamoDB
            self._log_activity('screenshot_captured', {
                's3_key': s3_key,
                'filename': filename
            })
            
            self.screenshot_count += 1
            
            # Check if alert needed (e.g., too many screenshots)
            if self.screenshot_count % 100 == 0:
                self._send_alert('info', f"Device {self.device_id} has captured {self.screenshot_count} screenshots")
            
        except Exception as e:
            logger.error(f"Error capturing screenshot: {e}")
    
    def _on_key_press(self, key):
        """Callback for keyboard events"""
        if not self.config.ENABLE_KEYLOGGING:
            return
        
        try:
            # Get key representation
            try:
                key_str = key.char
            except AttributeError:
                key_str = str(key)
            
            # Add to buffer
            self.keylog_buffer.append({
                'key': key_str,
                'timestamp': datetime.now(UTC).isoformat(),
                'device_id': self.device_id
            })
            
            # Upload buffer when it reaches threshold
            if len(self.keylog_buffer) >= self.config.KEYLOG_BUFFER_SIZE:
                self._upload_keylogs()
                
        except Exception as e:
            logger.error(f"Error in key press handler: {e}")
    
    def _upload_keylogs(self):
        """Upload keylog buffer to DynamoDB"""
        if not self.keylog_buffer:
            return
        
        try:
            # Create batch
            timestamp = datetime.now(UTC).isoformat()
            log_entry = {
                'log_id': f"{self.device_id}_{int(time.time())}",
                'device_id': self.device_id,
                'timestamp': timestamp,
                'type': 'keylog',
                'data': json.dumps(self.keylog_buffer),
                'count': len(self.keylog_buffer)
            }
            
            # Upload to DynamoDB
            self.logs_table.put_item(Item=log_entry)
            
            logger.info(f"Uploaded {len(self.keylog_buffer)} keylog events")
            
            # Clear buffer
            self.keylog_buffer = []
            
        except Exception as e:
            logger.error(f"Error uploading keylogs: {e}")
    
    def _log_activity(self, activity_type: str, data: dict):
        """Log activity to DynamoDB"""
        try:
            import getpass
            log_entry = {
                'log_id': f"{self.device_id}_{int(time.time() * 1000)}",
                'device_id': self.device_id,
                'user': getpass.getuser(),
                'timestamp': datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z',
                'type': activity_type,
                'data': json.dumps(data)
            }
            
            self.logs_table.put_item(Item=log_entry)
            
        except Exception as e:
            logger.error(f"Error logging activity: {e}")
    
    def _send_alert(self, severity: str, message: str):
        """Send alert via SNS"""
        try:
            if self.config.SNS_TOPIC_ARN:
                self.sns_client.publish(
                    TopicArn=self.config.SNS_TOPIC_ARN,
                    Subject=f"KeyGuard360 Alert - {severity.upper()}",
                    Message=json.dumps({
                        'device_id': self.device_id,
                        'severity': severity,
                        'message': message,
                        'timestamp': datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
                    })
                )
                logger.info(f"Alert sent: {message}")
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
    
    def update_device_status(self):
        """Update device status in DynamoDB"""
        try:
            system_info = self.get_system_info()
            
            device_entry = {
                'device_id': self.device_id,
                'hostname': system_info.get('hostname', 'Unknown'),
                'user': system_info.get('user', 'Unknown'),
                'os': system_info.get('os', 'Unknown'),
                'last_seen': datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z',
                'status': 'online',
                'agent_version': self.config.AGENT_VERSION,
                'system_info': json.dumps(system_info)
            }
            
            self.devices_table.put_item(Item=device_entry)
            
            # Also log to activity logs so dashboard can see system info without scanning devices table
            self._log_activity('device_info_update', system_info)
            
            logger.info("Device status updated and info logged")
            
        except Exception as e:
            logger.error(f"Error updating device status: {e}")
    
    def start_keyboard_listener(self):
        """Start keyboard listener in background thread"""
        if not self.config.ENABLE_KEYLOGGING:
            logger.info("Keylogging disabled by configuration")
            return
        
        def listener_thread():
            with keyboard.Listener(on_press=self._on_key_press) as listener:
                listener.join()
        
        thread = threading.Thread(target=listener_thread, daemon=True)
        thread.start()
        logger.info("Keyboard listener started")
    
    def run(self):
        """Main agent loop"""
        logger.info("=" * 60)
        logger.info("KeyGuard360 Monitoring Agent Starting")
        logger.info("=" * 60)
        logger.info(f"Device ID: {self.device_id}")
        logger.info(f"Hostname: {platform.node()}")
        logger.info(f"OS: {platform.system()} {platform.release()}")
        logger.info(f"Screenshot Interval: {self.config.SCREENSHOT_INTERVAL}s")
        logger.info(f"Status Update Interval: {self.config.STATUS_UPDATE_INTERVAL}s")
        logger.info(f"Screenshots Enabled: {self.config.ENABLE_SCREENSHOTS}")
        logger.info(f"Keylogging Enabled: {self.config.ENABLE_KEYLOGGING}")
        logger.info("=" * 60)
        
        # Display consent notice
        print("\n" + "=" * 60)
        print("EMPLOYEE MONITORING CONSENT NOTICE")
        print("=" * 60)
        print("This device is monitored by KeyGuard360 for security purposes.")
        print("By using this device, you consent to monitoring of:")
        print("  - Screen activity (screenshots)")
        print("  - Keyboard activity (keylogs)")
        print("  - System performance metrics")
        print("  - Application usage")
        print("\nAll data is stored securely and used only for:")
        print("  - Security threat detection")
        print("  - Compliance monitoring")
        print("  - Productivity analysis")
        print("=" * 60)
        input("Press ENTER to acknowledge and start agent...")
        
        self.running = True
        
        # Start keyboard listener
        self.start_keyboard_listener()
        
        # Update initial device status
        self.update_device_status()
        
        last_screenshot_time = 0
        last_status_update_time = 0
        
        try:
            while self.running:
                current_time = time.time()
                
                # Capture screenshot at interval
                if current_time - last_screenshot_time >= self.config.SCREENSHOT_INTERVAL:
                    self.capture_screenshot()
                    last_screenshot_time = current_time
                
                # Update device status at interval
                if current_time - last_status_update_time >= self.config.STATUS_UPDATE_INTERVAL:
                    self.update_device_status()
                    last_status_update_time = current_time
                
                # Upload any remaining keylogs periodically
                if len(self.keylog_buffer) > 0:
                    self._upload_keylogs()
                
                # Sleep for a bit
                time.sleep(10)
                
        except KeyboardInterrupt:
            logger.info("Agent stopped by user")
        except Exception as e:
            logger.error(f"Agent error: {e}")
            self._send_alert('critical', f"Agent crashed: {str(e)}")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the agent gracefully"""
        logger.info("Stopping agent...")
        self.running = False
        
        # Upload any remaining keylogs
        if self.keylog_buffer:
            self._upload_keylogs()
        
        # Update device status to offline
        try:
            self.devices_table.update_item(
                Key={'device_id': self.device_id},
                UpdateExpression='SET #status = :status, last_seen = :timestamp',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'offline',
                    ':timestamp': datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
                }
            )
        except Exception as e:
            logger.error(f"Error updating final status: {e}")
        
        logger.info("Agent stopped")


def main():
    """Main entry point"""
    # Load configuration
    config = Config()
    
    # Validate configuration
    if not config.validate():
        logger.error("Invalid configuration. Please check config.py")
        return
    
    # Create and run agent
    agent = KeyGuardAgent(config)
    agent.run()


if __name__ == '__main__':
    main()
