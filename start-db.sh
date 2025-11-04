#!/bin/bash

# Camping Place Manager - MongoDB Startup Script
# This script starts MongoDB with local data storage in the repo

echo "🏕️ Starting Camping Place Manager Database..."

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed!"
    echo "Please install MongoDB:"
    echo "  macOS: brew install mongodb-community"
    echo "  Ubuntu: sudo apt-get install mongodb"
    echo "  Or visit: https://docs.mongodb.com/manual/installation/"
    exit 1
fi

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "🚀 Starting MongoDB with local data storage..."
    
    # Create data directory if it doesn't exist (in repo)
    mkdir -p ./data/db
    
    # Create log directory
    mkdir -p ./data/db/logs
    
    # Remove lock file if it exists (from previous crash)
    rm -f ./data/db/WiredTiger.lock
    
    # Start MongoDB with local data path as a replica set (required for Prisma transactions)
    # Using nohup for macOS compatibility
    nohup mongod --dbpath ./data/db --port 27017 --bind_ip 127.0.0.1 --replSet rs0 --logpath ./data/db/logs/mongod.log > ./data/db/logs/mongod-startup.log 2>&1 &
    
    # Get the process ID
    MONGO_PID=$!
    
    # Wait a moment for MongoDB to start
    sleep 5
    
    # Check if process is still running
    if ps -p $MONGO_PID > /dev/null 2>&1; then
        # Check if MongoDB is actually listening on the port
        if lsof -ti:27017 > /dev/null 2>&1; then
            echo "✅ MongoDB started successfully on port 27017 (PID: $MONGO_PID)"
            echo "📁 Data stored in: ./data/db"
            echo "📝 Logs: ./data/db/logs/mongod.log"
            
            # Initialize replica set if not already initialized
            echo "🔧 Initializing replica set..."
            mongosh mongodb://localhost:27017 --eval "try { rs.status() } catch(e) { rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]}) }" > /dev/null 2>&1
            
            # Wait for replica set to be ready
            sleep 2
            echo "✅ Replica set configured (required for Prisma transactions)"
        else
            echo "⚠️  MongoDB process started but not listening on port 27017"
            echo "📝 Check logs: ./data/db/logs/mongod.log"
        fi
    else
        echo "❌ Failed to start MongoDB"
        echo "📝 Check logs: ./data/db/logs/mongod-startup.log"
        if [ -f ./data/db/logs/mongod-startup.log ]; then
            tail -10 ./data/db/logs/mongod-startup.log
        fi
        exit 1
    fi
fi

# Check if Next.js dev server is already running
if lsof -ti:3000 > /dev/null; then
    echo "✅ Next.js dev server is already running on port 3000"
else
    echo "ℹ️  Next.js dev server not running. Start it with: npm run dev"
fi

echo ""
echo "🎉 Camping Place Manager Database is ready!"
echo "📊 Database: MongoDB on port 27017 (local)"
echo "📁 Data location: ./data/db"
echo "🌐 Next.js: http://localhost:3000 (run 'npm run dev' to start)"
echo ""
echo "To stop MongoDB, run: ./stop-db.sh"
echo "To restart MongoDB, run: ./restart-db.sh"
