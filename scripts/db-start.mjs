#!/usr/bin/env node
/**
 * Start MongoDB for Camping Place Manager (detached, so it survives npm exit).
 */
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, unlinkSync, existsSync, readFileSync } from 'node:fs';
import {
  projectRoot,
  dataDir,
  logDir,
  logFile,
  MONGO_PORT,
  NEXT_PORT,
  isPortInUse,
  getPidsOnPort,
} from './db-common.mjs';

console.log('🏕️ Starting Camping Place Manager Database...');

// Check if mongod is available
try 
{
  execSync('mongod --version', { stdio: 'ignore' });
}
catch 
{
  console.error('❌ MongoDB is not installed!');
  console.error('Please install MongoDB:');
  console.error('  macOS: brew install mongodb-community');
  console.error('  Ubuntu: sudo apt-get install mongodb');
  console.error('  Or visit: https://www.mongodb.com/docs/manual/installation/');
  process.exit(1);
}

if (isPortInUse(MONGO_PORT)) 
{
  console.log('✅ MongoDB is already running on port 27017');
}
else 
{
  console.log('🚀 Starting MongoDB with local data storage...');
  mkdirSync(logDir, { recursive: true });

  const lockFile = `${dataDir}/WiredTiger.lock`;
  if (existsSync(lockFile)) 
  {
    try 
    {
      unlinkSync(lockFile);
    }
    catch 
    {
      // ignore
    }
  }

  const child = spawn(
    'mongod',
    [
      '--dbpath', dataDir,
      '--port', String(MONGO_PORT),
      '--bind_ip', '127.0.0.1',
      '--replSet', 'rs0',
      '--logpath', logFile,
    ],
    { detached: true, stdio: 'ignore', cwd: projectRoot, env: process.env }
  );
  child.unref();

  const pidFile = `${dataDir}/mongod.pid`;
  try 
  {
    writeFileSync(pidFile, String(child.pid), 'utf8');
  }
  catch 
  {
    // PID file optional
  }

  // Wait for MongoDB to listen
  const waitMs = 5000;
  const step = 500;
  let waited = 0;
  while (waited < waitMs) 
  {
    await new Promise(r => setTimeout(r, step));
    waited += step;
    if (isPortInUse(MONGO_PORT)) 
    {
      break;
    }
  }

  if (isPortInUse(MONGO_PORT)) 
  {
    const pids = getPidsOnPort(MONGO_PORT);
    console.log(`✅ MongoDB started successfully on port 27017 (PID: ${pids[0] ?? child.pid})`);
    console.log('📁 Data stored in: ./data/db');
    console.log('📝 Logs: ./data/db/logs/mongod.log');
    console.log('🔧 Initializing replica set...');
    try 
    {
      execSync(
        'mongosh mongodb://localhost:27017 --eval "try { rs.status() } catch(e) { rs.initiate({_id: \'rs0\', members: [{_id: 0, host: \'localhost:27017\'}]}) }"',
        { stdio: 'ignore', cwd: projectRoot }
      );
      await new Promise(r => setTimeout(r, 2000));
      console.log('✅ Replica set configured (required for Prisma transactions)');
    }
    catch 
    {
      console.log('⚠️  Replica set init skipped (mongosh may be unavailable)');
    }
  }
  else 
  {
    console.error('❌ Failed to start MongoDB');
    console.error('📝 Check logs: ./data/db/logs/mongod.log');
    if (existsSync(logFile)) 
    {
      const lines = readFileSync(logFile, 'utf8').trim().split('\n').slice(-10);
      lines.forEach(l => console.error('   ', l));
    }
    process.exit(1);
  }
}

if (isPortInUse(NEXT_PORT)) 
{
  console.log('✅ Next.js dev server is already running on port 3000');
}
else 
{
  console.log('ℹ️  Next.js dev server not running. Start it with: npm run dev');
}

console.log('');
console.log('🎉 Camping Place Manager Database is ready!');
console.log('📊 Database: MongoDB on port 27017 (local)');
console.log('📁 Data location: ./data/db');
console.log('🌐 Next.js: http://localhost:3000 (run \'npm run dev\' to start)');
console.log('');
console.log('To stop MongoDB:    npm run db:stop');
console.log('To restart MongoDB: npm run db:restart');
