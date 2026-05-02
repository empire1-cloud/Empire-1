from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import uuid
import zipfile
import io
import json

router = APIRouter(prefix="/foundry/api", tags=["SLA113 Foundry"])

# ---------------------------------------------------------
# REQUEST MODELS
# ---------------------------------------------------------

class ApproveRequest(BaseModel):
    mode: str = "arcade_hybrid"
    timestamp: Optional[int] = None

class RejectRequest(BaseModel):
    prompt: str = "Universal Regen"
    timestamp: Optional[int] = None

# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------

@router.get("/audit-state")
def get_audit_state(x_tenant_id: Optional[str] = Header(None)):
    """
    Returns the current state of the foundry audit stage.
    This includes wallet balance and the set of assets currently being rendered.
    """
    # Security: Only sla113 (operator) or local dev can access foundry
    # In a real scenario, we'd check against a more rigorous permission system
    if x_tenant_id and x_tenant_id != "sla113":
        raise HTTPException(status_code=403, detail="Foundry restricted to SLA113 Operator context")

    return {
        "success": True,
        "gems": 1500.00,
        "total_units": 40,
        "module_a_assets": [
            {"file": "fish_boss_01.png", "type": "BOSS", "id": "A_01"}
        ],
        "module_s_assets": [
            {"file": "g_shield_gold.png", "type": "GOLD", "id": "S_01"},
            {"file": "g-shield-wolf.png", "type": "WOLF", "id": "S_02"}
        ],
        "system_state": "STABLE",
        "vault_hash": "700_ENFORCED",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/approve")
def approve_render(body: ApproveRequest, x_tenant_id: Optional[str] = Header(None)):
    """
    Approve the current render stage, finalizing the manifest and locking it into production.
    """
    if x_tenant_id and x_tenant_id != "sla113":
        raise HTTPException(status_code=403, detail="Foundry restricted to SLA113 Operator context")

    # Finalize logic would go here (e.g. updating REGISTRY_MANIFEST.json)
    return {
        "success": True, 
        "message": "Render approved and finalized.", 
        "manifest_id": str(uuid.uuid4()).upper()[:8],
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/reject")
def reject_render(body: RejectRequest, x_tenant_id: Optional[str] = Header(None)):
    """
    Discard the current render stage and trigger a regen or flush.
    """
    if x_tenant_id and x_tenant_id != "sla113":
        raise HTTPException(status_code=403, detail="Foundry restricted to SLA113 Operator context")

    return {
        "success": True, 
        "message": "Render stage flushed and discarded.",
        "timestamp": datetime.utcnow().isoformat()
    }


# ---------------------------------------------------------
# EXPORT / DOWNLOAD ENDPOINTS
# ---------------------------------------------------------

GAME_TEMPLATES = {
    "ARCADE_24": {"name": "Arcade 24", "type": "fish_shooting", "seats": 24},
    "ARCADE_40": {"name": "Arcade 40", "type": "fish_shooting", "seats": 40},
    "ARCADE_60": {"name": "Arcade 60", "type": "fish_shooting", "seats": 60},
    "SLOTS_10": {"name": "Slots 10", "type": "slots", "seats": 10},
    "SLOTS_20": {"name": "Slots 20", "type": "slots", "seats": 20},
    "OPEN_WORLD": {"name": "Open World RPG", "type": "rpg", "seats": 100},
    "TACTICAL_FPS": {"name": "Tactical FPS", "type": "fps", "seats": 64},
    "RPG_QUEST": {"name": "RPG Quest", "type": "rpg", "seats": 50},
    "CASINO_SUITE": {"name": "Casino Suite", "type": "casino", "seats": 100},
    "PACHINKO": {"name": "Pachinko", "type": "pachinko", "seats": 80},
    "LOTTERY": {"name": "Lottery", "type": "lottery", "seats": 1000},
    "BINGO": {"name": "Bingo", "type": "bingo", "seats": 100},
    "SPORTSBOOK": {"name": "Sportsbook", "type": "sports", "seats": 500},
    "CARD_GAMES": {"name": "Card Games", "type": "cards", "seats": 100},
    "HYBRID_MIX": {"name": "Hybrid Mix", "type": "hybrid", "seats": 50},
}


@router.get("/export/{template_id}")
def export_game_build(
    template_id: str,
    client_name: str = "Client",
    x_tenant_id: Optional[str] = Header(None)
):
    """
    Export a complete game OS build as a ZIP file.
    Client can download and host on their own domain.
    """
    if template_id not in GAME_TEMPLATES:
        raise HTTPException(status_code=404, detail=f"Template {template_id} not found")
    
    template = GAME_TEMPLATES[template_id]
    build_id = f"SLA-{template_id}-{datetime.utcnow().strftime('%Y%m%d')}"
    
    # Create in-memory ZIP
    buffer = io.BytesIO()
    
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Game configuration
        config = {
            "build_id": build_id,
            "client_name": client_name,
            "template": template,
            "created_at": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "sla113_license": {
                "issuer": "SLA113",
                "type": "white_label",
                "domain": f"{client_name.lower().replace(' ', '')}.com"
            }
        }
        zf.writestr("game_config.json", json.dumps(config, indent=2))
        
        # Game index.html (loader)
        index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{template['name']} - Game OS</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ background: #0a0808; overflow: hidden; }}
        #game-container {{ width: 100vw; height: 100vh; }}
        .loading {{ 
            position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
            background: #0a0808; color: #1E90FF; font-family: 'DM Sans', sans-serif;
        }}
        .loading-spinner {{ 
            width: 50px; height: 50px; border: 3px solid #1E90FF30; border-top-color: #1E90FF;
            border-radius: 50%; animation: spin 1s linear infinite;
        }}
        @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
    </style>
</head>
<body>
    <div class="loading"><div class="loading-spinner"></div></div>
    <div id="game-container"></div>
    <script src="game.bundle.js"></script>
    <script>
        // Initialize game with config
        window.SLA113_GAME = {{
            buildId: '{build_id}',
            template: '{template_id}',
            client: '{client_name}',
            apiEndpoint: '/api'
        }};
    </script>
</body>
</html>"""
        zf.writestr("index.html", index_html)
        
        # README with deployment instructions
        readme = f"""# {template['name']} - SLA113 White Label Build

## Build Info
- Build ID: {build_id}
- Template: {template['name']}
- Client: {client_name}
- Created: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

## Deployment Instructions

### Option 1: Self-Hosted
1. Upload all files to your web server (nginx/apache)
2. Configure SSL certificate
3. Update game_config.json with your domain
4. Set up backend API connections

### Option 2: Cloud (AWS S3 + CloudFront)
1. Create S3 bucket with static website hosting
2. Upload all files
3. Configure CloudFront distribution
4. Add custom SSL certificate (ACM)
5. Point your domain to CloudFront

### Option 3: Docker
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
```

## API Configuration
Update `/api` endpoint in index.html to point to your SLA113 backend.

## Support
Contact SLA113 support for backend setup and licensing.
"""
        zf.writestr("README.md", readme)
        
        # Nginx config example
        nginx_conf = f"""server {{
    listen 80;
    server_name {client_name.lower().replace(' ', '')}.com;
    
    root /var/www/{template_id.lower()};
    index index.html;
    
    location / {{
        try_files $uri $uri/ /index.html;
    }}
    
    location /api {{
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }}
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico)$ {{
        expires 1y;
        add_header Cache-Control "public, immutable";
    }}
}}
"""
        zf.writestr("nginx.conf", nginx_conf)
        
        # Placeholder for game bundle (in real implementation, this would be the compiled game)
        zf.writestr("game.bundle.js", f"// SLA113 Game Bundle - {build_id}\\n// Template: {template_id}\\nconsole.log('SLA113 Game OS v1.0 - {template_id}')")
        
        # Asset manifest
        assets_manifest = {
            "build_id": build_id,
            "template": template_id,
            "assets": [],
            "sounds": [],
            "sprites": []
        }
        zf.writestr("assets/manifest.json", json.dumps(assets_manifest, indent=2))
    
    buffer.seek(0)
    
    filename = f"{build_id}_{client_name.replace(' ', '_')}.zip"
    
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Build-ID": build_id
        }
    )


@router.get("/templates")
def list_templates(x_tenant_id: Optional[str] = Header(None)):
    """List all available game templates for export."""
    return {
        "templates": [
            {
                "id": tid,
                "name": t["name"],
                "type": t["type"],
                "seats": t["seats"]
            }
            for tid, t in GAME_TEMPLATES.items()
        ]
    }
