import { execSync } from 'node:child_process';
import path from 'node:path';

/**
 * Sets up the test environment by:
 * 1. Setting the DATABASE_URL to the test database
 * 2. Running `prisma db push` to create the test database
 * 3. Running `tsx server/src/test/seedE2e.ts` to seed the test database
 */
async function globalSetup(): Promise<void> 
{
  const root = process.cwd();
  const testDbPath = path.join(root, 'data', 'test.db');
  process.env.DATABASE_URL = `file:${testDbPath}`;

  execSync('npx prisma db push', {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });

  execSync('npx tsx server/src/test/seedE2e.ts', {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });
}

export default globalSetup;
