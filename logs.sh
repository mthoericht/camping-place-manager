#!/bin/bash

# Camping Place Manager - Status and Logs Script
# This script shows status for MongoDB and Next.js, and displays logs

echo "🏕️ Camping Place Manager - Status & Logs"
echo "=========================================="
echo ""

# Show MongoDB status
if pgrep -x "mongod" > /dev/null; then
    MONGO_PID=$(pgrep -x "mongod")
    echo "📊 MongoDB Status: ✅ Running (PID: $MONGO_PID)"
    
    # Check if replica set is initialized
    RS_STATUS=$(mongosh mongodb://localhost:27017 --quiet --eval "try { rs.status().ok } catch(e) { 0 }" 2>/dev/null)
    if [ "$RS_STATUS" = "1" ]; then
        echo "   └─ Replica Set: ✅ Initialized (rs0)"
    else
        echo "   └─ Replica Set: ⚠️  Not initialized"
    fi
    
    # Check port
    if lsof -ti:27017 > /dev/null 2>&1; then
        echo "   └─ Port: ✅ Listening on 27017"
    else
        echo "   └─ Port: ❌ Not listening"
    fi
    
    # Show data directory size
    if [ -d "./data/db" ]; then
        DB_SIZE=$(du -sh ./data/db 2>/dev/null | cut -f1)
        echo "   └─ Data Size: $DB_SIZE"
    fi
else
    echo "📊 MongoDB Status: ❌ Not running"
fi

echo ""

# Show Next.js status
if lsof -ti:3000 > /dev/null 2>&1; then
    NEXTJS_PID=$(lsof -ti:3000)
    echo "🌐 Next.js Status: ✅ Running (PID: $NEXTJS_PID)"
    echo "   └─ URL: http://localhost:3000"
else
    echo "🌐 Next.js Status: ❌ Not running"
    echo "   └─ Start with: npm run dev"
fi

echo ""
echo "📊 Database Configuration:"
echo "   └─ URL: mongodb://localhost:27017/camping-place-manager"
echo "   └─ Data Location: ./data/db"
echo "   └─ Logs: ./data/db/logs/mongod.log"

echo ""
echo "📋 Recent MongoDB Logs (last 10 lines):"
echo "─────────────────────────────────────────"
if [ -f "./data/db/logs/mongod.log" ]; then
    tail -10 ./data/db/logs/mongod.log | sed 's/^/   /'
else
    echo "   No log file found"
fi

echo ""
echo "💡 Quick Commands:"
echo "   Start MongoDB:    npm run db:start"
echo "   Stop MongoDB:     npm run db:stop"
echo "   Restart MongoDB:  npm run db:restart"
echo "   View Full Logs:   tail -f ./data/db/logs/mongod.log"
