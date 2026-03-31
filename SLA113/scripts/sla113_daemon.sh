#!/bin/bash
# SLA113 Foundry Daemon
# Background worker for processing build queue

QUEUE_FILE="/root/SLA113/factory/queue.json"
ARCHIVE_DIR="/root/SLA113/archive/builds"
LOG_FILE="/root/SLA113/scripts/sla113_daemon.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

process_build() {
    local build_json="$1"
    local build_id=$(echo "$build_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('build_id',''))")
    local mode=$(echo "$build_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('render_mode',''))")
    
    log "Processing build: $build_id (mode: $mode)"
    
    local output_dir="$ARCHIVE_DIR/$build_id"
    mkdir -p "$output_dir"
    
    if [ "$mode" = "fast" ]; then
        sleep 2
    else
        sleep 8
    fi
    
    cat > "$output_dir/manifest.json" << EOF
{
  "build_id": "$build_id",
  "status": "completed",
  "render_mode": "$mode",
  "completed_at": "$(date -Iseconds)"
}
EOF
    
    echo "# $build_id - boot" > "$output_dir/boot.bin"
    echo "# $build_id - kernel" > "$output_dir/kernel.os"
    echo "# $build_id - assets" > "$output_dir/assets.pkg"
    
    log "Build completed: $build_id"
}

log "SLA113 Foundry Daemon starting..."

while true; do
    if [ -f "$QUEUE_FILE" ]; then
        queue_length=$(python3 -c "import json; print(len(json.load(open('$QUEUE_FILE'))))" 2>/dev/null || echo "0")
        
        if [ "$queue_length" -gt 0 ]; then
            log "Queue has $queue_length items, processing..."
            
            python3 << 'EOF'
import json

queue_file = "/root/SLA113/factory/queue.json"
archive_dir = "/root/SLA113/archive/builds"

with open(queue_file, 'r') as f:
    queue = json.load(f)

if queue:
    build = queue[0]
    if build.get('status') == 'queued':
        build['status'] = 'processing'
        
        import os
        from datetime import datetime
        import hashlib
        
        build_id = build['build_id']
        output_dir = os.path.join(archive_dir, build_id)
        os.makedirs(output_dir, exist_ok=True)
        
        if build.get('render_mode') == 'fast':
            import time
            time.sleep(2)
        else:
            import time
            time.sleep(8)
        
        manifest = {
            "build_id": build_id,
            "game_type": build.get('game_type'),
            "category": build.get('category'),
            "render_mode": build.get('render_mode'),
            "palette": build.get('palette'),
            "status": "completed",
            "created_at": build.get('created_at'),
            "completed_at": datetime.now().isoformat()
        }
        
        with open(os.path.join(output_dir, 'manifest.json'), 'w') as f:
            json.dump(manifest, f, indent=2)
        
        for fname in ['boot.bin', 'kernel.os', 'assets.pkg']:
            with open(os.path.join(output_dir, fname), 'w') as f:
                f.write(f"# {fname} - {build_id}\n")
        
        queue.pop(0)
        
        with open(queue_file, 'w') as f:
            json.dump(queue, f, indent=2)
        
        print(f"COMPLETED:{build_id}")
EOF
        fi
    fi
    
    sleep 5
done
