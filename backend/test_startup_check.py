"""
Diagnostic script to verify FastAPI app import and route registration for Render deployment.
"""
import sys
from pathlib import Path

# Ensure backend directory is on sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

print("[Startup Check] Testing module imports...")

try:
    from app.main import app
    print("[Startup Check] app.main imported successfully!")
    
    # List registered routes
    routes = [route.path for route in app.routes]
    print(f"[Startup Check] Registered routes ({len(routes)}): {routes}")
    
    assert "/health" in routes, "/health endpoint missing!"
    assert "/" in routes, "Root / endpoint missing!"
    assert "/api/process" in routes, "/api/process endpoint missing!"
    assert "/api/upload" in routes, "/api/upload endpoint missing!"
    
    print("[Startup Check] ALL CHECKS PASSED SUCCESSFULLY!")
except Exception as e:
    print(f"[Startup Check] ERROR: {e}")
    sys.exit(1)
