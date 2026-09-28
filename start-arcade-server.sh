#!/bin/bash
# Serve the Learning Arcade locally, then open http://localhost:8000
cd "$(dirname "$0")"
echo "Learning Arcade running at http://localhost:8000 (Ctrl+C to stop)"
python3 -m http.server 8000 --bind 127.0.0.1
