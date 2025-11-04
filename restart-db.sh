#!/bin/bash

# Camping Place Manager - Restart Database Script
# This script stops and restarts MongoDB

echo "🔄 Restarting Camping Place Manager Database..."

# Stop MongoDB first
echo "🛑 Stopping MongoDB..."
./stop-db.sh

# Wait a moment for cleanup
echo "⏳ Waiting for cleanup..."
sleep 3

# Start MongoDB
echo "🚀 Starting MongoDB..."
./start-db.sh

echo ""
echo "✅ MongoDB restart complete!"
