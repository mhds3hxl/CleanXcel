import os
import re
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

index_path = os.path.join(STATIC_DIR, "index.html")
css_path = os.path.join(STATIC_DIR, "css", "style.css")
js_path = os.path.join(STATIC_DIR, "js", "app.js")

with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

# Inline CSS
html = html.replace('<link rel="stylesheet" href="/static/css/style.css">', f"<style>\n{css}\n</style>")

# Add SheetJS and PapaParse in head for offline support
head_cdns = """
    <!-- SheetJS & PapaParse for Client-Side Offline Processing -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
"""
html = html.replace('<!-- Custom Style -->', head_cdns + '\n    <!-- Custom Style -->')

# Prepend smart API_BASE detection to javascript
api_base_header = """
const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? (window.location.port === '8000' || window.location.pathname.startsWith('/api') ? '' : 'http://127.0.0.1:8000')
    : 'http://127.0.0.1:8000';
"""

# Adapt fetch endpoints in js so when opened as file://, it connects to http://127.0.0.1:8000
js_adapted = js
js_adapted = re.sub(r'fetch\((\'|")/api/', r'fetch(`${API_BASE}/api/', js_adapted)
js_adapted = re.sub(r'window\.location\.href\s*=\s*(\'|")/api/', r'window.location.href = `${API_BASE}/api/', js_adapted)
js_adapted = re.sub(r'(\'|")/api/download/', r'`${API_BASE}/api/download/', js_adapted)
js_adapted = api_base_header + "\n" + js_adapted

# Replace script tag with inlined JS
html = html.replace('<script src="/static/js/app.js"></script>', f"<script>\n{js_adapted}\n</script>")

out_path = os.path.join(STATIC_DIR, "SheetForge_Pro_Tool.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Generated standalone HTML tool: {out_path} ({os.path.getsize(out_path):,} bytes)")

# Copy to Downloads if target exists
try:
    downloads_target = r"C:\Users\EMVIGO-USER\Downloads\SheetForge_Pro_Tool.html"
    if os.path.exists(os.path.dirname(downloads_target)):
        shutil.copy2(out_path, downloads_target)
        print(f"Copied standalone HTML tool to: {downloads_target}")
except Exception:
    pass
