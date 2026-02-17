import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname);
const testDbPath = path.join(root, 'data', 'test.db');

process.env.DATABASE_URL = `file:${testDbPath}`;
execSync('npx prisma db push', {
  cwd: root,
  stdio: 'pipe',
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
});

const { installIntegrationFetch } = await import('./server/src/test/integrationEnv');
installIntegrationFetch();
