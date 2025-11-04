#!/bin/bash

# Camping Place Manager - Stop Database Script
# This script stops MongoDB

echo "🛑 Stopping Camping Place Manager Database..."

# Stop MongoDB
if pgrep -x "mongod" > /dev/null; then
    echo "🛑 Stopping MongoDB..."
    kill -9 $(pgrep -x "mongod")
    echo "✅ MongoDB stopped"
    echo "📁 Data preserved in: ./data/db"
else
    echo "ℹ️  MongoDB was not running"
fi

echo ""
echo "🏁 MongoDB stopped!"
echo "To start again, run: ./start-db.sh"
