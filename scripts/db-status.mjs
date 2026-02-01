#!/usr/bin/env node
/**
 * Show MongoDB and Next.js status plus recent logs.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import {
  projectRoot,
  dataDir,
  logFile,
  MONGO_PORT,
  NEXT_PORT,
  isPortInUse,
  getPidsOnPort,
} from './db-common.mjs';

console.log('🏕️ Camping Place Manager - Status & Logs');
console.log('==========================================');
console.log('');

if (isPortInUse(MONGO_PORT)) 
{
  const pids = getPidsOnPort(MONGO_PORT);
  const pidLabel = pids.length <= 1 ? `PID: ${pids[0] ?? '?'}` : `PIDs: ${pids.join(', ')}`;
  console.log(`📊 MongoDB Status: ✅ Running (${pidLabel})`);
  try 
  {
    const out = execSync(
      'mongosh mongodb://localhost:27017 --quiet --eval "try { rs.status().ok } catch(e) { 0 }"',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], cwd: projectRoot }
    );
    const ok = out.trim();
    if (ok === '1') 
    {
      console.log('   └─ Replica Set: ✅ Initialized (rs0)');
    }
    else 
    {
      console.log('   └─ Replica Set: ⚠️  Not initialized');
    }
  }
  catch 
  {
    console.log('   └─ Replica Set: (check skipped)');
  }
  console.log('   └─ Port: ✅ Listening on 27017');
  if (existsSync(dataDir) && process.platform !== 'win32') 
  {
    try 
    {
      const size = execSync(`du -sh "${dataDir}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split(/\s/)[0];
      console.log(`   └─ Data Size: ${size}`);
    }
    catch 
    {
      // ignore
    }
  }
}
else 
{
  console.log('📊 MongoDB Status: ❌ Not running');
}

console.log('');

if (isPortInUse(NEXT_PORT)) 
{
  const nextPids = getPidsOnPort(NEXT_PORT);
  const nextPidLabel = nextPids.length <= 1 ? `PID: ${nextPids[0] ?? '?'}` : `PIDs: ${nextPids.join(', ')}`;
  console.log(`🌐 Next.js Status: ✅ Running (${nextPidLabel})`);
  console.log('   └─ URL: http://localhost:3000');
}
else 
{
  console.log('🌐 Next.js Status: ❌ Not running');
  console.log('   └─ Start with: npm run dev');
}

console.log('');
console.log('📊 Database Configuration:');
console.log('   └─ URL: mongodb://localhost:27017/camping-place-manager');
console.log('   └─ Data Location: ./data/db');
console.log('   └─ Logs: ./data/db/logs/mongod.log');
console.log('');
console.log('📋 Recent MongoDB Logs (last 10 lines):');
console.log('─────────────────────────────────────────');
if (existsSync(logFile)) 
{
  const lines = readFileSync(logFile, 'utf8').trim().split('\n').slice(-10);
  lines.forEach(l => console.log('   ', l));
}
else 
{
  console.log('   No log file found');
}
console.log('');
console.log('💡 Quick Commands:');
console.log('   Start MongoDB:    npm run db:start');
console.log('   Stop MongoDB:     npm run db:stop');
console.log('   Restart MongoDB:  npm run db:restart');
console.log('   View Full Logs:   tail -f ./data/db/logs/mongod.log');
