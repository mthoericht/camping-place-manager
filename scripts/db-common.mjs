/**
 * Shared paths and helpers for DB scripts (Node.js, cross-platform where possible).
 */
import { execSync } from 'node:child_process';
import { join } from 'node:path';

export const projectRoot = join(process.cwd());
export const dataDir = join(projectRoot, 'data', 'db');
export const logDir = join(dataDir, 'logs');
export const logFile = join(logDir, 'mongod.log');
export const MONGO_PORT = 27017;
export const NEXT_PORT = 3000;

/**
 * Get PIDs listening on a port (Unix: lsof; Windows: netstat).
 * Returns array of PID numbers or [].
 */
export function getPidsOnPort(port) 
{
  try 
  {
    const isWin = process.platform === 'win32';
    if (isWin) 
    {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const pids = [...new Set(out.split('\n').map(line => 
      {
        const m = line.trim().split(/\s+/);
        const pid = m[m.length - 1];
        return pid && pid !== '0' ? parseInt(pid, 10) : null;
      }).filter(Boolean))];
      return pids;
    }
    const out = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return out.trim().split(/\s+/).filter(Boolean).map(s => parseInt(s, 10));
  }
  catch 
  {
    return [];
  }
}

export function isPortInUse(port) 
{
  return getPidsOnPort(port).length > 0;
}
