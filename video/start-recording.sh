#!/bin/bash
# Screen recording for #BuildHybridAI demo
# Usage: ./start-recording.sh [output-file]

OUT="${1:-demo-recording.mp4}"
ffmpeg   -f x11grab   -framerate 30   -i "${DISPLAY}:0.0+0,0"   -f pulse -i default   -c:v libx264 -preset fast -crf 23   -c:a aac -b:a 128k   "$OUT"

