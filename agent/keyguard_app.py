import tkinter as tk
from tkinter import messagebox, font
import threading
import sys
import os
from PIL import Image, ImageDraw
import pystray
from pystray import MenuItem as item
from keyguard_agent import KeyGuardAgent
from config import config

class KeyGuardGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("KeyGuard360 - Security Setup")
        self.root.geometry("500x450")
        self.root.resizable(False, False)
        self.root.configure(bg="#f8fafc")
        
        # Setup the Agent
        self.agent = KeyGuardAgent(config)
        self.agent_thread = None
        self.icon = None
        
        self._build_ui()

    def _build_ui(self):
        # Header
        header_frame = tk.Frame(self.root, bg="#1e293b", height=80)
        header_frame.pack(fill="x")
        
        title_font = font.Font(family="Segoe UI", size=16, weight="bold")
        tk.Label(header_frame, text="🛡️ KeyGuard360 Monitoring", fg="white", bg="#1e293b", font=title_font, pady=20).pack()

        # Content
        content_frame = tk.Frame(self.root, bg="#f8fafc", padx=30, pady=20)
        content_frame.pack(fill="both", expand=True)

        info_text = (
            "This device is monitored for security and compliance purposes.\n\n"
            "By clicking 'Accept', you consent to the following:\n"
            "• Periodic screen activity capture\n"
            "• Intelligent keyboard activity logging\n"
            "• System health and process monitoring\n\n"
            "All data is encrypted and sent securely to company AWS storage.\n"
            "This application will run silently in the background."
        )
        
        tk.Label(content_frame, text=info_text, justify="left", bg="#f8fafc", wraplength=440, 
                 font=("Segoe UI", 10), fg="#475569").pack(pady=10)

        # Footer Buttons
        btn_frame = tk.Frame(self.root, bg="#f8fafc", pady=20)
        btn_frame.pack(fill="x")

        tk.Button(btn_frame, text="Decline & Exit", command=self.root.destroy, width=15, 
                  bg="#e2e8f0", bd=0, padx=10, pady=5).pack(side="left", padx=40)
        
        tk.Button(btn_frame, text="Accept & Start", command=self.start_monitoring, width=15, 
                  bg="#3b82f6", fg="white", bd=0, padx=10, pady=5, font=("Segoe UI", 10, "bold")).pack(side="right", padx=40)

    def create_tray_icon(self):
        # Create a simple icon image
        width = 64
        height = 64
        image = Image.new('RGB', (width, height), color=(30, 41, 59))
        dc = ImageDraw.Draw(image)
        dc.rectangle([16, 16, 48, 48], fill=(59, 130, 246)) # Blue shield-like square
        
        menu = pystray.Menu(
            item('Status: Monitoring Active', lambda: None, enabled=False),
            item('Open Settings', self.show_settings),
            item('Exit Agent', self.stop_monitoring)
        )
        
        self.icon = pystray.Icon("KeyGuard360", image, "KeyGuard360", menu)
        self.icon.run()

    def show_settings(self):
        messagebox.showinfo("Management", f"Device ID: {self.agent.device_id}\nVersion: 1.0.0\nSync: Active")

    def start_monitoring(self):
        self.root.withdraw() # Hide the window
        
        # Patch the agent's run method to skip the 'input()' call
        def silent_run():
            self.agent.running = True
            self.agent.start_keyboard_listener()
            self.agent.update_device_status()
            
            import time
            last_screenshot = 0
            last_status = 0
            
            while self.agent.running:
                current_time = time.time()
                if current_time - last_screenshot >= self.agent.config.SCREENSHOT_INTERVAL:
                    self.agent.capture_screenshot()
                    last_screenshot = current_time
                if current_time - last_status >= self.agent.config.STATUS_UPDATE_INTERVAL:
                    self.agent.update_device_status()
                    last_status = current_time
                if len(self.agent.keylog_buffer) > 0:
                    self.agent._upload_keylogs()
                time.sleep(10)
        
        # Run agent in a background thread
        self.agent_thread = threading.Thread(target=silent_run, daemon=True)
        self.agent_thread.start()
        
        # Start tray icon in main thread
        self.create_tray_icon()

    def stop_monitoring(self):
        self.agent.stop()
        if self.icon:
            self.icon.stop()
        sys.exit()

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = KeyGuardGUI()
    app.run()
