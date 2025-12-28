import customtkinter as ctk
from datetime import datetime
import tkinter as tk
from tkinter import ttk
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")
plt.style.use('dark_background')

class KeyGuardDashboard(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("KeyGuard360 - Login")
        self.geometry("800x600")
        self.show_login_screen()


        self.current_figure = None
        self.current_canvas = None
        self.current_ax = None
        self.current_device = None

    def show_login_screen(self):
        self.clear_all()
        login_frame = ctk.CTkFrame(self, corner_radius=0)
        login_frame.pack(fill="both", expand=True)

        ctk.CTkLabel(login_frame, text="KeyGuard360", font=("Arial", 40, "bold")).pack(pady=60)
        ctk.CTkLabel(login_frame, text="Enterprise Monitoring System", font=("Arial", 20)).pack(pady=10)
        ctk.CTkLabel(login_frame, text="Admin Login (Powered by AWS Cognito)", font=("Arial", 16), text_color="gray").pack(pady=30)
        
        ctk.CTkEntry(login_frame, placeholder_text="Username (e.g., admin)", width=300).pack(pady=10)
        ctk.CTkEntry(login_frame, placeholder_text="Password", show="*", width=300).pack(pady=10)
        
        ctk.CTkButton(login_frame, text="Sign In", command=self.fake_login, width=300, height=40).pack(pady=30)
        ctk.CTkLabel(login_frame, text="Demo: Use any credentials", text_color="gray").pack(pady=20)

    def fake_login(self):
        self.title("KeyGuard360 - Enterprise Monitoring Dashboard")
        self.geometry("1200x800")
        self.update()
        self.clear_all()
        self.setup_main_dashboard()

    def clear_all(self):
        for widget in self.winfo_children():
            widget.destroy()

    def setup_main_dashboard(self):
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        #Sidebar
        self.sidebar = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nswe")
        ctk.CTkLabel(self.sidebar, text="KeyGuard360", font=("Arial", 20, "bold")).pack(pady=40, padx=20)        

        nav_items = [
            ("Overview", self.show_overview),
            ("Device Status", self.show_device_status),
            ("Alerts", self.show_alerts),
            ("Settings", self.show_settings)
        ]
        for text, command in nav_items:
            ctk.CTkButton(self.sidebar, text=text, command=command, width=180, height=40, corner_radius=10, fg_color="transparent", anchor="w").pack(fill="x", pady=10, padx=10)

        # Main container
        self.main_container = ctk.CTkFrame(self, corner_radius=0)
        self.main_container.grid(row=0, column=1, sticky="nswe", padx=10, pady=10) 
        self.main_container.grid_columnconfigure(0, weight=1)
        self.main_container.grid_rowconfigure(0, weight=1)

        # Status bar
        self.status_label = ctk.CTkLabel(self, text="AWS Backend: Connected (simulated) • Last sync: Never",  corner_radius=0)
        self.status_label.grid(row=1, column=0, columnspan=2, sticky="ew")

        self.mock_devices = [
            ("DEV-001", "Alice Johnson", "Online", "2 min ago", "142 logs"),
            ("DEV-002", "Bob Smith", "Online", "Just now", "89 logs"),
            ("DEV-003", "Carol White", "Offline", "3 hours ago", "0 logs"),
            ("DEV-004", "David Lee", "Online", "5 min ago", "201 logs"),
            ("DEV-005", "Eve Brown", "Idle", "45 min ago", "67 logs"),
        ]

        self.content_frame = None
        self.show_overview(self)

    def switch_content(self, new_frame):
        if self.content_frame:
            self.content_frame.destroy()
        self.content_frame = new_frame
        self.content_frame.grid(row=0, column=0, sticky="nsew")

    def refresh_all_data(self):
        now = datetime.now().strftime("%b %d, %Y %I:%M %p")
        self.status_label.configure(text=f"AWS Backend: Connected (simulated) • Last sync: {now}")
        
        # Force refresh current view
        if self.content_frame is not None:
            if "Overview" in str(self.content_frame):
                self.show_overview(self)
            elif hasattr(self, 'current_device'):
                self.show_device_details(self.current_device)

    def show_overview(self):
        frame = ctk.CTkFrame(self.main_container)

        # Title + Refresh
        ctk.CTkLabel(frame, text="Dashboard Overview", font=("Arial", 32, "bold")).grid(row=0, column=0, pady=(20,10), sticky="w")
        ctk.CTkButton(frame, text="🔄 Refresh Data from AWS", command=self.refresh_all_data, 
                      width=250, height=40, font=("Arial", 14, "bold")).grid(row=0, column=0, pady=(20,10), padx=(0,10), sticky="e")

        # Stats cards
        stats_frame = ctk.CTkFrame(frame)
        stats_frame.grid(row=1, column=0, sticky="ew", pady=10)
        stats_frame.grid_columnconfigure((0,1,2,3), weight=1)
        
        total_devices = np.random.randint(12, 18)
        active = np.random.randint(8, total_devices+1)
        alerts = np.random.randint(0, 7)
        compliance = np.random.randint(90, 99)
        
        stats = [
            ("Total Devices", str(total_devices), "#1f6aa5"),
            ("Active Now", str(active), "#2ecc71"),
            ("Alerts Today", str(alerts), "#e74c3c"),
            ("Compliance Score", f"{compliance}%", "#9b59b6")
        ]
        for i, (label, value, color) in enumerate(stats):
            card = ctk.CTkFrame(stats_frame, fg_color=color + "22", border_width=2, corner_radius=12)
            card.grid(row=0, column=i, padx=15, pady=15, sticky="ew")
            ctk.CTkLabel(card, text=value, font=("Arial", 36, "bold")).pack(pady=(10,0))
            ctk.CTkLabel(card, text=label, font=("Arial", 14)).pack(pady=(0,15))

        # Chart container
        chart_frame = ctk.CTkFrame(frame, fg_color="transparent")
        chart_frame.grid(row=2, column=0, sticky="nsew", pady=(30,0))
        chart_frame.grid_columnconfigure(0, weight=1)
        chart_frame.grid_rowconfigure(1, weight=1)

        ctk.CTkLabel(chart_frame, text="System-Wide Keystroke Activity (Last 24 Hours)", 
                     font=("Arial", 24)).grid(row=0, column=0, pady=(0,10), sticky="w")

        # Create figure and canvas
        fig = plt.Figure(figsize=(12, 4.5), dpi=100, facecolor='#212121')
        ax = fig.add_subplot(111)
        hours = np.arange(0, 24)
        activity = np.random.randint(30, 350, size=24)
        ax.plot(hours, activity, color='#1f6aa5', linewidth=3, marker='o', markersize=6)
        ax.set_title("Keystrokes per Hour", color='white', fontsize=16)
        ax.set_xlabel("Hour of Day", color='gray')
        ax.set_ylabel("Keystrokes", color='gray')
        ax.grid(True, color='#333333', linestyle='--')
        ax.set_facecolor('#212121')

        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().grid(row=1, column=0, sticky="nsew")

        # Keep references
        self.current_figure = fig
        self.current_canvas = canvas
        self.current_ax = ax

        frame.grid_rowconfigure(2, weight=1)
        frame.grid_columnconfigure(0, weight=1)
        self.switch_content(frame)

    def show_device_status(self):
        frame = ctk.CTkFrame(self.main_container)
        ctk.CTkLabel(frame, text="Registered Devices", font=("Arial", 32, "bold")).grid(row=0, column=0, pady=(20,20), sticky="w")
        ctk.CTkButton(frame, text="🔄 Refresh Data from AWS", command=self.refresh_all_data, 
                      width=250, height=40, font=("Arial", 14, "bold")).grid(row=0, column=0, pady=(20,10), padx=(0,10), sticky="e")

        columns = ("Device ID", "User", "Status", "Last Seen", "Logs Today")
        tree = ttk.Treeview(frame, columns=columns, show="headings", height=15, selectmode="browse")
        style = ttk.Style()
        style.theme_use("default")
        style.configure("Treeview", background="#2a2a2a", foreground="white", fieldbackground="#2a2a2a", rowheight=35)
        style.map("Treeview", background=[("selected", "#1f6aa5")])

        for col in columns:
            tree.heading(col, text=col)
            tree.column(col, anchor="center", width=180)

        for i, device in enumerate(self.mock_devices):
            tag = "online" if device[2] == "Online" else "offline" if device[2] == "Offline" else "idle"
            tree.insert("", "end", iid=i, values=device, tags=(tag,))

        tree.tag_configure("online", foreground="#2ecc71")
        tree.tag_configure("offline", foreground="#e74c3c")
        tree.tag_configure("idle", foreground="#f39c12")

        tree.bind("<<TreeviewSelect>>", lambda e: self.on_device_select(tree))
        tree.grid(row=1, column=0, sticky="nsew", pady=10)
        frame.grid_rowconfigure(1, weight=1)
        frame.grid_columnconfigure(0, weight=1)

        scrollbar = ttk.Scrollbar(frame, orient="vertical", command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=1, column=1, sticky="ns")

        self.switch_content(frame)
        self.current_tree = tree

    def on_device_select(self, tree):
        selected = tree.selection()
        if not selected:
            return
        index = int(selected[0])
        device = self.mock_devices[index]
        self.current_device = device
        self.show_device_details(device)

    def show_device_details(self, device):
        frame = ctk.CTkFrame(self.main_container)
        ctk.CTkButton(frame, text="← Back to Devices", command=self.show_device_status, width=150).grid(row=0, column=0, pady=20, padx=20, sticky="w")
        ctk.CTkButton(frame, text="🔄 Refresh Data from AWS", command=self.refresh_all_data, 
                      width=250, height=40, font=("Arial", 14, "bold")).grid(row=0, column=0, pady=(20,10), padx=(0,10), sticky="e")
        
        ctk.CTkLabel(frame, text=f"Device Details: {device[0]} - {device[1]}", font=("Arial", 32, "bold"))\
            .grid(row=1, column=0, columnspan=2, pady=(0,20), sticky="w", padx=20)

        info_frame = ctk.CTkFrame(frame)
        info_frame.grid(row=2, column=0, columnspan=2, sticky="ew", padx=20, pady=10)
        info_frame.grid_columnconfigure((0,1,2,3), weight=1)
        info_items = [("User", device[1]), ("Status", device[2]), ("Last Seen", device[3]), ("Logs Today", device[4])]
        for i, (label, value) in enumerate(info_items):
            card = ctk.CTkFrame(info_frame, corner_radius=12)
            card.grid(row=0, column=i, padx=10, pady=10, sticky="ew")
            ctk.CTkLabel(card, text=value, font=("Arial", 20)).pack(pady=10)
            ctk.CTkLabel(card, text=label, font=("Arial", 12), text_color="gray").pack()

        ctk.CTkLabel(frame, text="Daily Activity Breakdown (Last 7 Days)", font=("Arial", 24))\
            .grid(row=3, column=0, columnspan=2, pady=(40,10), sticky="w", padx=20)
        
        fig = plt.Figure(figsize=(10, 4), dpi=100, facecolor='#212121')
        ax = fig.add_subplot(111)
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        logs = np.random.randint(50, 250, size=7)
        ax.bar(days, logs, color='#1f6aa5')
        ax.set_title("Keystrokes per Day", color='white', fontsize=16)
        ax.set_ylabel("Keystrokes", color='gray')
        ax.set_facecolor('#212121')
        
        canvas = FigureCanvasTkAgg(fig, master=frame)
        canvas.draw()
        canvas.get_tk_widget().grid(row=4, column=0, columnspan=2, sticky="ew", pady=20)

        # Keep reference
        self.current_figure = fig
        self.current_canvas = canvas
        self.current_ax = ax

        # Screenshots and logs (placeholders)
        ctk.CTkLabel(frame, text="Recent Screenshots", font=("Arial", 24)).grid(row=5, column=0, columnspan=2, pady=(40,10), sticky="w", padx=20)
        screenshot_frame = ctk.CTkFrame(frame)
        screenshot_frame.grid(row=6, column=0, columnspan=2, sticky="ew", padx=20)
        screenshot_frame.grid_columnconfigure((0,1,2), weight=1)
        for i in range(3):
            placeholder = ctk.CTkCanvas(screenshot_frame, width=300, height=180, bg="#333333", highlightthickness=0)
            placeholder.create_rectangle(10, 10, 290, 170, fill="#444444", outline="#555555")
            placeholder.create_text(150, 90, text=f"Screenshot {i+1}\nDec 24, 2025", fill="white", font=("Arial", 14))
            placeholder.grid(row=0, column=i, padx=15, pady=15)

        ctk.CTkLabel(frame, text="Recent Keystrokes", font=("Arial", 24)).grid(row=7, column=0, columnspan=2, pady=(40,10), sticky="w", padx=20)
        log_box = ctk.CTkTextbox(frame, height=150)
        log_box.grid(row=8, column=0, columnspan=2, sticky="ew", padx=20, pady=10)
        log_box.insert("0.0", "Opened email → Checked project updates\nTyped report summary → [ENTER]\n...")
        log_box.configure(state="disabled")

        self.switch_content(frame)

    def show_alerts(self):
        frame = ctk.CTkFrame(self.main_container)
        ctk.CTkLabel(frame, text="Recent Alerts", font=("Arial", 32, "bold")).grid(row=0, column=0, pady=40, sticky="w", padx=20)
        ctk.CTkLabel(frame, text="• High activity spike on DEV-004\n• Offline device alert: DEV-003", font=("Arial", 16), justify="left").grid(row=1, column=0, padx=40)
        self.switch_content(frame)

    def show_settings(self):
        frame = ctk.CTkFrame(self.main_container)
        ctk.CTkLabel(frame, text="Monitoring Settings", font=("Arial", 32, "bold")).grid(row=0, column=0, pady=40, sticky="w", padx=20)
        ctk.CTkLabel(frame, text="Data synced from AWS S3/DynamoDB\nScreenshot interval: 5 min\nAlerts via SNS", font=("Arial", 16)).grid(row=1, column=0, padx=40)
        self.switch_content(frame)

if __name__ == "__main__":
    app = KeyGuardDashboard()
    app.mainloop()