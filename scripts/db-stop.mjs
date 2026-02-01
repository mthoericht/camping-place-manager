#!/usr/bin/env node
/**
 * Stop MongoDB (process listening on port 27017).
 */
import { execSync } from 'node:child_process';
import { getPidsOnPort, MONGO_PORT } from './db-common.mjs';

console.log('🛑 Stopping Camping Place Manager Database...');

const pids = getPidsOnPort(MONGO_PORT);
if (pids.length === 0) 
{
  console.log('ℹ️  MongoDB was not running');
}
else 
{
  console.log('🛑 Stopping MongoDB...');
  const isWin = process.platform === 'win32';
  for (const pid of pids) 
  {
    try 
    {
      if (isWin) 
      {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      }
      else 
      {
        process.kill(pid, 'SIGKILL');
      }
    }
    catch 
    {
      // Process may already be gone
    }
  }
  console.log('✅ MongoDB stopped');
  console.log('📁 Data preserved in: ./data/db');
}

console.log('');
console.log('🏁 MongoDB stopped!');
console.log('To start again: npm run db:start');
