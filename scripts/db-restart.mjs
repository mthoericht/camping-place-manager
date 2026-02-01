#!/usr/bin/env node
/**
 * Restart MongoDB: stop, wait, start.
 */
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const scriptsDir = join(process.cwd(), 'scripts');

console.log('🔄 Restarting Camping Place Manager Database...');

console.log('🛑 Stopping MongoDB...');
execSync('node ./scripts/db-stop.mjs', { stdio: 'inherit', cwd: process.cwd() });

console.log('⏳ Waiting for cleanup...');
await new Promise(r => setTimeout(r, 3000));

console.log('🚀 Starting MongoDB...');
execSync('node ./scripts/db-start.mjs', { stdio: 'inherit', cwd: process.cwd() });

console.log('');
console.log('✅ MongoDB restart complete!');
