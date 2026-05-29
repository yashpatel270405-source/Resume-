#!/bin/bash
# Move to the folder where this script is located
cd "$(dirname "$0")"

echo "--------------------------------------------------------"
echo "🚀 RESUBUILD - STARTING LOCAL DEVELOPMENT SERVER"
echo "--------------------------------------------------------"
echo "Target folder: $(pwd)"

# 1. Kill any zombie processes currently occupying port 8000
echo "🧹 Checking and cleaning port 8000..."
ZOMBIE_PID=$(lsof -t -i:8000)
if [ ! -z "$ZOMBIE_PID" ]; then
  echo "Killing zombie process on port 8000 (PID: $ZOMBIE_PID)..."
  kill -9 $ZOMBIE_PID >/dev/null 2>&1
  sleep 1
fi

echo "Starting server on http://localhost:8000..."

# 2. Automatically open the browser to http://localhost:8000 in 1 second
(sleep 1 && open "http://localhost:8000") &

# 3. Start the server (try ruby, fallback to python3 if ruby fails)
if command -v ruby >/dev/null 2>&1; then
  ruby -run -e httpd -- --port=8000 .
elif command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 8000
else
  echo "❌ Error: Neither Ruby nor Python3 is installed on this Mac!"
  echo "Please install Ruby or Python to run this local host server."
  read -p "Press enter to close..."
fi
