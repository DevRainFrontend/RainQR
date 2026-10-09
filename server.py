import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime
import os

PORT = 3000

# Simple in-memory database
db = {
    "visits": 0,
    "generated_qrs": []
}

# Try to load from file if exists
DB_FILE = "db.json"
if os.path.exists(DB_FILE):
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            db = json.load(f)
    except:
        pass

def save_db():
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f)

class AdminHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/admin' or self.path == '/admin/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            # Admin Dashboard HTML
            admin_html = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>RainQR - Admin Dashboard</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    body {{ font-family: 'Inter', sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 20px; }}
                    .container {{ max-width: 900px; margin: 0 auto; }}
                    h1 {{ color: #3b82f6; }}
                    .stats-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }}
                    .stat-card {{ background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; }}
                    .stat-card h3 {{ margin: 0 0 10px 0; color: #6b7280; font-size: 1rem; }}
                    .stat-card .value {{ font-size: 2.5rem; font-weight: 700; color: #1f2937; margin: 0; }}
                    .logs-card {{ background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
                    table {{ width: 100%; border-collapse: collapse; text-align: left; }}
                    th, td {{ padding: 12px; border-bottom: 1px solid #e5e7eb; }}
                    th {{ color: #6b7280; font-weight: 600; }}
                    .back-btn {{ display: inline-block; margin-bottom: 20px; text-decoration: none; color: #3b82f6; font-weight: 600; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <a href="/" class="back-btn">&larr; Back to App</a>
                    <h1>Admin Dashboard</h1>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Total Site Visits</h3>
                            <p class="value" id="visit-count">{db['visits']}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Total QR Codes Generated</h3>
                            <p class="value" id="qr-count">{len(db['generated_qrs'])}</p>
                        </div>
                    </div>

                    <div class="logs-card">
                        <h2>Recent QR Codes Generated</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date/Time</th>
                                    <th>Type</th>
                                    <th>Data Preview</th>
                                </tr>
                            </thead>
                            <tbody>
                                {''.join([f"<tr><td>{qr['time']}</td><td>{qr.get('type', 'Unknown').upper()}</td><td>{qr.get('data', '')[:50]}...</td></tr>" for qr in reversed(db['generated_qrs'][-20:])])}
                            </tbody>
                        </table>
                    </div>
                </div>
            </body>
            </html>
            """
            self.wfile.write(admin_html.encode('utf-8'))
            return
            
        elif self.path == '/api/stats':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(db).encode('utf-8'))
            return
            
        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b""
        
        try:
            data = json.loads(post_data.decode('utf-8')) if post_data else {}
        except:
            data = {}

        if self.path == '/api/log_visit':
            db["visits"] += 1
            save_db()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
            return
            
        elif self.path == '/api/log_qr':
            qr_info = {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "type": data.get("type", "unknown"),
                "data": data.get("data", "")
            }
            db["generated_qrs"].append(qr_info)
            save_db()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

# Disable logging to terminal to keep it clean
def log_message(self, format, *args):
    pass
AdminHandler.log_message = log_message

with socketserver.TCPServer(("", PORT), AdminHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
